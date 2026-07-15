# 02 — Directus Schema Inventory

## Evidence provenance

This inventory is built from the supplied compatibility matrix (`uploaded-artifact-1.md`, SHA-256: `1232129fbac0241a08ccfe94f00299aa98a0aa0f624650769021f5f06d09b1c9`) and the master prompt (`uploaded-artifact-2.md`, SHA-256: `6f2d582cc0abb625a482cffb98d6da11fded889bae74147725970f814356204a`).

**The matrix is authoritative for collection disposition, curated ownership intent, sync intent, and safety notes. It is NOT a raw Directus schema snapshot.**

### Source-declared totals

| Metric           | Value | Status                                                                     |
| ---------------- | ----- | -------------------------------------------------------------------------- |
| Collections      | 140   | Verified — all 140 appear in the matrix                                    |
| Top-level fields | 2,432 | Source-declared aggregate count only; field-level detail is unavailable    |
| Relations        | 421   | Source-declared aggregate count only; relation-level detail is unavailable |

### Schema fingerprint status

- `directusSchemaFingerprint`: `UNKNOWN_PENDING_SCHEMA_SNAPSHOT`
- `rawDirectusSchemaAvailable`: `false`
- Evidence-document SHA-256 hashes are **not** Directus schema fingerprints. They prove source provenance only.

## Unknown sentinel policy

Every unavailable raw-schema fact uses the exact value `UNKNOWN_PENDING_SCHEMA_SNAPSHOT`. This includes:

- `fieldType` — column data type (e.g., varchar, boolean, json, timestamp)
- `isNullable` — NOT NULL constraint state
- `isUnique` — unique constraint state
- `relationTarget` — foreign key target collection
- `deleteBehavior` — CASCADE / SET NULL / RESTRICT
- `aiEligibility` — whether the field may enter AI context
- `dataClassification` — security/privacy classification
- `retention` — retention policy

Provenance fields (source, sourceLine) may be null only when no raw source exists. No field or relation row is fabricated. No value is inferred, estimated, or left blank.

## Authority normalization

The matrix uses six legend values. These are mapped to the seven canonical authorities:

| Matrix legend            | Canonical authority                        | Loss                          | Notes                                                         |
| ------------------------ | ------------------------------------------ | ----------------------------- | ------------------------------------------------------------- |
| `DIRECTUS_AUTHORITATIVE` | `DIRECTUS_AUTHORITATIVE`                   | Lossless                      | Direct qualifiers retained in raw text                        |
| `TWENTY_AUTHORITATIVE`   | `TWENTY_AUTHORITATIVE`                     | Lossless                      | Migration state retained in raw text                          |
| `SPLIT_BY_FIELD`         | `NOT_ALLOWED_TO_SYNC`                      | Collection authority withheld | Exact reviewed field rows required; no collection-wide writes |
| `APPEND_ONLY_SHARED`     | `APPEND_ONLY_BOTH_WITH_SHARED_IDEMPOTENCY` | Lossless rename               |                                                               |
| `REFERENCE_ONLY`         | `REFERENCE_ONLY_NO_REPLICATION`            | Qualified rename              | Exact allowed reference columns specified                     |
| `NO_SYNC`                | `NOT_ALLOWED_TO_SYNC`                      | Stronger (fail-closed)        |                                                               |

Prose authority cells receive a human-reviewed normalization with loss classification. Fuzzy inference is forbidden. Unresolved prose remains sync-blocked.

## Future snapshot enrichment

When a raw Directus schema snapshot becomes available:

1. Acquire via read-only API access or SQL dump.
2. Compute a real schema fingerprint.
3. Fill observed-schema wrapper fields (type, nullability, constraints, relations, delete behavior).
4. Curated governance decisions (ownership, classification, retention, AI eligibility, deny rules) remain byte-stable — the snapshot enriches but cannot overwrite them.
5. A drift contract test detects additions, removals, and breaking changes.

## Disposition summary

| Disposition    | Count                                                           | Meaning |
| -------------- | --------------------------------------------------------------- | ------- |
| MAPPED         | Active sync target with Twenty object                           |         |
| REFERENCE_ONLY | External ID/hash/link only, no editable copy                    |         |
| PORTAL_ONLY    | Remains in Directus; no Twenty target                           |         |
| LEGACY         | Historical/quarantined; preserved but excluded from progression |         |
| OUT_OF_SCOPE   | Sandbox/test/infrastructure; excluded from production           |         |

See `directus-schema-inventory.json` for exact counts and `directus-to-twenty-map.md` for the full 140-row table.
