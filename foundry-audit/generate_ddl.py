#!/usr/bin/env python3
"""
Generate PostgreSQL DDL from a Palantir Foundry Ontology Manager JSON export.

Reads ontology.json and produces:
  1. foundry_ddl.sql           — CREATE TABLE + PRIMARY KEY for every included object type
  2. foundry_fk.sql            — ALTER TABLE … ADD CONSTRAINT FOREIGN KEY for one-to-many relations
  3. foundry_junction.sql      — Junction tables for many-to-many relations
  4. foundry_ddl_report.md     — Human-readable summary of what was generated and what was skipped

Column naming: Uses the actual backing dataset column name (source.columnName) where
available, so that columns match what readTable API returns. Falls back to apiName
(converted to snake_case) for editOnly and redacted properties that have no dataset column.

Filtering: Example, deprecated, and test object types are excluded by default.
"""

import json
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
INPUT_FILE = SCRIPT_DIR / "ontology.json"
OUTPUT_DIR = SCRIPT_DIR

# ---------------------------------------------------------------------------
# Foundry -> PostgreSQL type mapping
# ---------------------------------------------------------------------------
TYPE_MAP = {
    "STRING": "TEXT",
    "INTEGER": "INTEGER",
    "LONG": "BIGINT",
    "DOUBLE": "DOUBLE PRECISION",
    "FLOAT": "REAL",
    "BOOLEAN": "BOOLEAN",
    "DATE": "DATE",
    "TIMESTAMP": "TIMESTAMPTZ",
    "DECIMAL": "NUMERIC",
    "SHORT": "SMALLINT",
    "GEOHASH": "DOUBLE PRECISION[]",      # lat/lon pair; use PostGIS geography(POINT,4326) if available
    "GEOSHAPE": "JSONB",                   # GeoJSON; use PostGIS geography(GEOMETRY,4326) if available
    "VECTOR": "DOUBLE PRECISION[]",        # use pgvector vector(n) if available
    "MEDIA_REFERENCE": "JSONB",            # {mediaSetRid, mediaItemRid, mimeType}
    "STRUCT": "JSONB",
    "ARRAY": "JSONB",
    "TIME_DEPENDENT": "JSONB",             # time-series reference; needs materialisation
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def to_snake_case(name: str) -> str:
    """Convert camelCase / PascalCase to snake_case."""
    s1 = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", name)
    s2 = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s1)
    return s2.lower()


def pg_identifier(name: str, max_len: int = 63) -> str:
    """Sanitise a string into a valid PostgreSQL identifier."""
    s = to_snake_case(name)
    s = re.sub(r"[^a-z0-9_]", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    # PostgreSQL identifiers cannot start with a digit
    if s and s[0].isdigit():
        s = f"n{s}"
    return s[:max_len]


def is_excluded(ot: dict) -> tuple[bool, str]:
    """Return (should_exclude, reason) for an object type."""
    status = ot["status"]["type"]
    api_name = ot["apiName"]
    display = ot.get("displayMetadata", {}).get("displayName", "")

    if status == "example":
        return True, "example"
    if status == "deprecated":
        return True, "deprecated (status)"
    if "[depr]" in display.lower() or "[deprecated]" in display.lower():
        return True, "deprecated (display name)"
    if "deprecated" in display.lower() and display.lower().startswith("[deprecated"):
        return True, "deprecated (display name)"
    # Explicit test types
    test_keywords = ["devtest", "pdftest", "enzotest"]
    if any(kw in api_name.lower() for kw in test_keywords):
        return True, "test object"
    return False, ""


def resolve_col_name(prop: dict) -> str:
    """Get the PostgreSQL column name for a property.

    Prefers the actual backing dataset column name (source.columnName) so that
    columns match what the readTable API returns.  Falls back to the ontology
    apiName (converted to snake_case) for editOnly / redacted properties.
    """
    source = prop.get("source") or {}
    col_name = source.get("columnName")
    if col_name:
        return pg_identifier(col_name)
    return pg_identifier(prop["apiName"])


def resolve_pg_type(prop: dict) -> str:
    """Map a Foundry property to a PostgreSQL type string."""
    base = prop["baseType"]["type"]
    pg = TYPE_MAP.get(base, "TEXT")

    # For ARRAY, try to infer element type
    if base == "ARRAY":
        sub = prop["baseType"].get("subType", {}).get("type")
        if sub and sub in TYPE_MAP and sub not in ("ARRAY", "STRUCT"):
            pg = f"{TYPE_MAP[sub]}[]"

    # For VECTOR, try to get dimension
    if base == "VECTOR":
        dim = prop["baseType"].get("vectorDimension")
        if dim:
            pg = f"DOUBLE PRECISION[{dim}]"  # or vector({dim}) with pgvector

    return pg


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    with open(INPUT_FILE) as f:
        data = json.load(f)

    object_types = data["objectTypes"]
    relations = data["relations"]

    # Build lookup maps
    rid_to_ot = {ot["rid"]: ot for ot in object_types}
    id_to_ot = {ot["id"]: ot for ot in object_types}
    rid_to_api = {ot["rid"]: ot["apiName"] for ot in object_types}
    api_to_table = {}  # apiName -> pg table name

    # ---- Filtering --------------------------------------------------------
    included = []
    excluded = []
    for ot in object_types:
        skip, reason = is_excluded(ot)
        if skip:
            excluded.append((ot, reason))
        else:
            included.append(ot)

    excluded_rids = {ot["rid"] for ot, _ in excluded}

    # Build table name map for included types
    seen_tables = {}
    for ot in included:
        table = pg_identifier(ot["apiName"])
        # Handle collisions
        if table in seen_tables:
            table = f"{table}_{pg_identifier(ot['id'][-6:])}"
        seen_tables[table] = ot["apiName"]
        api_to_table[ot["apiName"]] = table

    # ---- DDL: CREATE TABLE ------------------------------------------------
    ddl_lines = []
    ddl_lines.append("-- ==========================================================================")
    ddl_lines.append("-- Foundry Ontology -> PostgreSQL DDL")
    ddl_lines.append(f"-- Generated from: {INPUT_FILE.name}")
    ddl_lines.append(f"-- Object types included: {len(included)}  |  excluded: {len(excluded)}")
    ddl_lines.append("-- ==========================================================================")
    ddl_lines.append("")

    type_stats = {}  # table -> {cols, pk, foundry_api_name}

    for ot in sorted(included, key=lambda o: o["apiName"]):
        api_name = ot["apiName"]
        table = api_to_table[api_name]
        display = ot.get("displayMetadata", {}).get("displayName", "")
        pk_ids = ot.get("primaryKeys", [])

        ddl_lines.append(f"-- {display}  (Foundry apiName: {api_name})")
        ddl_lines.append(f"CREATE TABLE {table} (")

        col_defs = []
        pk_cols = []
        prop_id_to_col = {}

        for prop in ot["properties"]:
            col = resolve_col_name(prop)
            pg_type = resolve_pg_type(prop)
            prop_id_to_col[prop["id"]] = col

            col_defs.append(f"  {col} {pg_type}")

        # Identify PK columns
        for pk_id in pk_ids:
            if pk_id in prop_id_to_col:
                pk_cols.append(prop_id_to_col[pk_id])

        if col_defs:
            # Add comma after each column except last, then PK constraint
            lines = []
            for i, cd in enumerate(col_defs):
                lines.append(cd)
            if pk_cols:
                lines.append(f"  CONSTRAINT pk_{table} PRIMARY KEY ({', '.join(pk_cols)})")
            ddl_lines.append(",\n".join(lines))
        ddl_lines.append(");")
        ddl_lines.append("")

        type_stats[table] = {
            "cols": len(col_defs),
            "pk": pk_cols,
            "foundry_api_name": api_name,
            "display_name": display,
        }

    # Write DDL
    ddl_path = OUTPUT_DIR / "foundry_ddl.sql"
    ddl_path.write_text("\n".join(ddl_lines), encoding="utf-8")

    # ---- FK: one-to-many relations ----------------------------------------
    fk_lines = []
    fk_lines.append("-- ==========================================================================")
    fk_lines.append("-- Foreign key constraints from Foundry one-to-many link types")
    fk_lines.append("-- ==========================================================================")
    fk_lines.append("")

    fk_count = 0
    fk_skipped = []

    for rel in relations:
        defn = rel["definition"]
        if defn["type"] != "oneToMany":
            continue

        otm = defn["oneToMany"]
        one_rid = otm.get("objectTypeRidOneSide", "")
        many_rid = otm.get("objectTypeRidManySide", "")

        # Skip if either side is excluded
        if one_rid in excluded_rids or many_rid in excluded_rids:
            fk_skipped.append((rel["id"], "references excluded type"))
            continue

        one_api = rid_to_api.get(one_rid)
        many_api = rid_to_api.get(many_rid)
        if not one_api or not many_api:
            fk_skipped.append((rel["id"], "unresolved object type RID"))
            continue

        one_table = api_to_table.get(one_api)
        many_table = api_to_table.get(many_api)
        if not one_table or not many_table:
            fk_skipped.append((rel["id"], "table not found"))
            continue

        # Resolve FK property on many side
        fk_prop_id = otm.get("manySideForeignKeyPropertyId", "")
        many_ot = rid_to_ot.get(many_rid) or id_to_ot.get(otm.get("objectTypeIdManySide", ""))
        if not many_ot:
            fk_skipped.append((rel["id"], "many-side OT not found"))
            continue

        fk_col = None
        for prop in many_ot["properties"]:
            if prop["id"] == fk_prop_id:
                fk_col = resolve_col_name(prop)
                break
        if not fk_col:
            fk_skipped.append((rel["id"], f"FK property '{fk_prop_id}' not found on {many_api}"))
            continue

        # Resolve PK on one side
        one_ot = rid_to_ot.get(one_rid)
        pk_ids = one_ot.get("primaryKeys", [])
        pk_col = None
        for prop in one_ot["properties"]:
            if prop["id"] in pk_ids:
                pk_col = resolve_col_name(prop)
                break
        if not pk_col:
            fk_skipped.append((rel["id"], "PK not found on one-side"))
            continue

        constraint = pg_identifier(f"fk_{many_table}_{fk_col}_{one_table}")
        fk_lines.append(f"-- {rel['id']}")
        fk_lines.append(
            f"ALTER TABLE {many_table} ADD CONSTRAINT {constraint} "
            f"FOREIGN KEY ({fk_col}) REFERENCES {one_table} ({pk_col});"
        )
        fk_lines.append("")
        fk_count += 1

    fk_path = OUTPUT_DIR / "foundry_fk.sql"
    fk_path.write_text("\n".join(fk_lines), encoding="utf-8")

    # ---- Junction tables: many-to-many relations --------------------------
    jt_lines = []
    jt_lines.append("-- ==========================================================================")
    jt_lines.append("-- Junction tables for Foundry many-to-many link types")
    jt_lines.append("-- ==========================================================================")
    jt_lines.append("")

    jt_count = 0
    jt_skipped = []

    for rel in relations:
        defn = rel["definition"]
        if defn["type"] != "manyToMany":
            continue

        mm = defn["manyToMany"]
        a_rid = mm.get("objectTypeRidA", "")
        b_rid = mm.get("objectTypeRidB", "")

        if a_rid in excluded_rids or b_rid in excluded_rids:
            jt_skipped.append((rel["id"], "references excluded type"))
            continue

        a_api = rid_to_api.get(a_rid)
        b_api = rid_to_api.get(b_rid)
        if not a_api or not b_api:
            jt_skipped.append((rel["id"], "unresolved object type RID"))
            continue

        a_table = api_to_table.get(a_api)
        b_table = api_to_table.get(b_api)
        if not a_table or not b_table:
            jt_skipped.append((rel["id"], "table not found"))
            continue

        # Resolve PK columns for each side
        a_ot = rid_to_ot.get(a_rid)
        b_ot = rid_to_ot.get(b_rid)

        def get_pk_col(ot):
            pk_ids = ot.get("primaryKeys", [])
            for prop in ot["properties"]:
                if prop["id"] in pk_ids:
                    return resolve_col_name(prop), resolve_pg_type(prop)
            return None, None

        a_pk, a_pk_type = get_pk_col(a_ot)
        b_pk, b_pk_type = get_pk_col(b_ot)

        if not a_pk or not b_pk:
            jt_skipped.append((rel["id"], "PK not resolved"))
            continue

        jt_name = pg_identifier(f"jt_{a_table}_{b_table}")
        a_fk_col = f"{a_table}_{a_pk}"[:63]
        b_fk_col = f"{b_table}_{b_pk}"[:63]

        jt_lines.append(f"-- {rel['id']}")
        jt_lines.append(f"CREATE TABLE {jt_name} (")
        jt_lines.append(f"  {a_fk_col} {a_pk_type} NOT NULL,")
        jt_lines.append(f"  {b_fk_col} {b_pk_type} NOT NULL,")
        jt_lines.append(f"  CONSTRAINT pk_{jt_name} PRIMARY KEY ({a_fk_col}, {b_fk_col}),")
        jt_lines.append(f"  CONSTRAINT fk_{jt_name}_{a_table} FOREIGN KEY ({a_fk_col}) REFERENCES {a_table} ({a_pk}),")
        jt_lines.append(f"  CONSTRAINT fk_{jt_name}_{b_table} FOREIGN KEY ({b_fk_col}) REFERENCES {b_table} ({b_pk})")
        jt_lines.append(");")
        jt_lines.append("")
        jt_count += 1

    jt_path = OUTPUT_DIR / "foundry_junction.sql"
    jt_path.write_text("\n".join(jt_lines), encoding="utf-8")

    # ---- Intermediary relations (logged, not generated as SQL) -------------
    intermediary_info = []
    for rel in relations:
        defn = rel["definition"]
        if defn["type"] != "intermediary":
            continue
        inter = defn["intermediary"]
        a_api = rid_to_api.get(inter.get("objectTypeRidA", ""), "?")
        b_api = rid_to_api.get(inter.get("objectTypeRidB", ""), "?")
        mid_api = rid_to_api.get(inter.get("intermediaryObjectTypeRid", ""), "?")
        intermediary_info.append((rel["id"], a_api, mid_api, b_api))

    # ---- Report -----------------------------------------------------------
    report = []
    report.append("# Foundry DDL Generation Report")
    report.append("")
    report.append("## Summary")
    report.append("")
    report.append(f"| Metric | Count |")
    report.append(f"|--------|-------|")
    report.append(f"| Object types in export | {len(object_types)} |")
    report.append(f"| Excluded (example/deprecated/test) | {len(excluded)} |")
    report.append(f"| **Tables generated** | **{len(included)}** |")
    report.append(f"| Total columns | {sum(s['cols'] for s in type_stats.values())} |")
    report.append(f"| Foreign key constraints | {fk_count} |")
    report.append(f"| FK constraints skipped | {len(fk_skipped)} |")
    report.append(f"| Junction tables | {jt_count} |")
    report.append(f"| Junction tables skipped | {len(jt_skipped)} |")
    report.append(f"| Intermediary (object-backed) links | {len(intermediary_info)} |")
    report.append("")
    report.append("## Output Files")
    report.append("")
    report.append(f"- `foundry_ddl.sql` — CREATE TABLE statements ({len(included)} tables)")
    report.append(f"- `foundry_fk.sql` — FOREIGN KEY constraints ({fk_count} constraints)")
    report.append(f"- `foundry_junction.sql` — Junction tables for M:N relations ({jt_count} tables)")
    report.append("")

    report.append("## Excluded Object Types")
    report.append("")
    report.append("| apiName | Display Name | Reason |")
    report.append("|---------|-------------|--------|")
    for ot, reason in sorted(excluded, key=lambda x: x[0]["apiName"]):
        display = ot.get("displayMetadata", {}).get("displayName", "")
        report.append(f"| {ot['apiName']} | {display} | {reason} |")
    report.append("")

    if fk_skipped:
        report.append("## Skipped FK Constraints")
        report.append("")
        report.append("| Relation ID | Reason |")
        report.append("|-------------|--------|")
        for rid, reason in fk_skipped:
            report.append(f"| {rid} | {reason} |")
        report.append("")

    if jt_skipped:
        report.append("## Skipped Junction Tables")
        report.append("")
        report.append("| Relation ID | Reason |")
        report.append("|-------------|--------|")
        for rid, reason in jt_skipped:
            report.append(f"| {rid} | {reason} |")
        report.append("")

    if intermediary_info:
        report.append("## Intermediary (Object-Backed) Links")
        report.append("")
        report.append("These are many-to-many relationships backed by a full object type (not a simple junction table).")
        report.append("The intermediary object type is already generated as its own table — no extra junction table needed.")
        report.append("")
        report.append("| Relation ID | Side A | Intermediary Object | Side B |")
        report.append("|-------------|--------|-------------------|--------|")
        for rid, a, mid, b in intermediary_info:
            report.append(f"| {rid} | {a} | {mid} | {b} |")
        report.append("")

    report.append("## Foundry Type → PostgreSQL Mapping Used")
    report.append("")
    report.append("| Foundry Type | PostgreSQL Type |")
    report.append("|-------------|----------------|")
    for ft, pt in sorted(TYPE_MAP.items()):
        report.append(f"| {ft} | `{pt}` |")
    report.append("")

    report_path = OUTPUT_DIR / "foundry_ddl_report.md"
    report_path.write_text("\n".join(report), encoding="utf-8")

    # ---- Console summary --------------------------------------------------
    print(f"Generated {len(included)} tables -> {ddl_path.name}")
    print(f"Generated {fk_count} FK constraints -> {fk_path.name}")
    print(f"Generated {jt_count} junction tables -> {jt_path.name}")
    print(f"Excluded {len(excluded)} object types (example/deprecated/test)")
    print(f"Skipped {len(fk_skipped)} FK constraints, {len(jt_skipped)} junction tables")
    print(f"Report -> {report_path.name}")


if __name__ == "__main__":
    main()
