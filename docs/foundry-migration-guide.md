# Palantir Foundry to PostgreSQL: complete migration guide

**Foundry's Ontology is a semantic abstraction layer — not a database — and migrating away requires extracting both the metadata (schema definitions, link types, action logic) and the underlying data (backing datasets) through separate channels.** For your instance at tob.palantirfoundry.com with 251 object types, 255 custom functions, and ~1.38 million rows, the most effective strategy combines the Ontology Manager's JSON export and the `fullMetadata` API endpoint for schema extraction, with the Foundry S3-compatible API or `readTable` endpoint for bulk data extraction. This report covers every layer of the system, every extraction method, and the concrete type mappings needed to land cleanly in PostgreSQL.

---

## 1. The Ontology is a semantic layer, not a database

Palantir Foundry's Ontology is an **operational semantic layer** that sits above raw datasets and maps them to business-meaningful entities. Palantir describes it as a "digital twin" of the organization. Where a traditional relational schema defines tables, columns, and foreign keys at the data level, the Ontology provides a domain-driven abstraction that decouples end-users from underlying data complexity — multiple heterogeneous sources (databases, APIs, streaming feeds, flat files) can be unified under a single model of typed objects, properties, and links.

The Ontology comprises two categories of elements. **Semantic elements** define structure: Object Types (entity schemas), Properties (typed attributes), and Link Types (relationships). **Kinetic elements** define behavior: Action Types (write-back operations), Functions (computed logic in TypeScript/Python), and dynamic security rules. This is fundamentally richer than a relational schema — it encompasses governance, permissioning, and workflow capabilities that have no direct SQL equivalent.

Ontology data types draw inspiration from **RDF, OWL, and XSD** standards, which explains why the system feels more like a knowledge graph than a relational database.

### Object Types and their properties

An **Object Type** is the schema definition of a real-world entity. Think of it as a table definition, but enriched with semantic metadata. Each Object Type has:

- A **display name** (user-facing) and **API name** (programmatic, immutable after creation)
- A **primary key** property that uniquely identifies each instance
- A **title key** property used for display in the UI
- A **RID** (Resource Identifier), auto-generated and globally unique
- A **status**: active, experimental, deprecated, or endorsed

**Properties** are the typed attributes — analogous to columns. Each property has a base type, an API name, a display name, and optional formatting rules. Foundry supports these base types: String, Integer, Long, Double, Float, Boolean, Date, Timestamp, Byte, Short, plus advanced types including **GeoPoint**, **GeoShape**, **Vector** (for semantic search, up to 2048 dimensions), **Attachment**, **Time Series**, **Media Reference**, and **Struct** (nested fields, max 10 fields, depth of 1). Notably, **Map, Decimal, and Binary** are valid dataset column types but are *not* valid as ontology property base types. The maximum is **2,000 properties per Object Type** on Object Storage V2.

Two special property categories matter for migration: **Edit-only properties** exist solely in the Ontology for user-entered data via Actions — they have no backing dataset column. **Shared properties** are reusable definitions shared across multiple Object Types for consistency.

**Interfaces** provide polymorphism — abstract types that define a shape (shared properties and link constraints) that concrete Object Types can implement. Interfaces have no backing datasets.

### Link Types encode relationships richer than foreign keys

A **Link Type** defines a relationship between two Object Types. Links are **directional** in definition (e.g., Employee → Company) but create **bidirectional traversal** capability — you can navigate from either end. Three cardinalities are supported: one-to-one, one-to-many (many-to-one), and many-to-many.

The critical detail for migration is **how links are backed**, because this determines where to find relationship data:

- **Foreign key links** (1:1, many:1): A property on one Object Type references the primary key of another. **No separate dataset required** — the link is derived from columns already in the backing datasets. The documentation confirms: "Links are stored as properties on the object, so there is no specific set up required."
- **Join table links** (many:many): A **separate Foundry dataset** serves as the link backing datasource. It contains columns mapping to the primary keys of both linked Object Types.
- **Object-backed links** (many:many with properties): An Object Type itself serves as the link, providing first-class properties on the relationship. This is equivalent to an associative entity in relational modeling.

### Action Types and write-back mechanics

An **Action Type** defines an atomic set of changes to objects, properties, and links. Actions can create, modify, or delete objects, add/remove links, and trigger side effects (notifications, webhooks). Each Action Type has **rules** (what changes to make), **parameters** (user inputs), and **submission criteria** (preconditions).

Rules can be simple ontology rules or **function-backed rules** using TypeScript/Python `@OntologyEditFunction()` decorators. Write-back behavior differs by storage version: On **Object Storage V1** (legacy/Phonograph), a separate writeback dataset must exist alongside the backing dataset. On **Object Storage V2**, the system handles edits natively with improved performance (up to 10,000 objects per action). User edits and source data are merged via a configurable **conflict resolution strategy**.

### Ontology Manager UI

The **Ontology Manager** is the primary configuration interface. It provides guided wizards for creating Object Types, Link Types, and Action Types; a property editor for mapping dataset columns; datasource management; status management; and an **ontology proposals and branches** system for testing changes before publishing. Critically for migration, it also has an **Export function** (Advanced settings → Export) that dumps the entire ontology working state as a JSON file.

---

## 2. Backing datasets are the data layer beneath the Ontology

A **backing dataset** is the Foundry dataset that provides actual data for an Object Type. The full chain is: **Object Type → backed by → Dataset → stored as → files (Parquet) → on backing filesystem (typically S3)**. Parquet is the default output format for Foundry transforms and is strongly preferred for performance.

### Cardinality rules between datasets and Object Types

**One dataset cannot back multiple Object Types.** This is explicitly enforced — attempting it returns `Phonograph2:DatasetAndBranchAlreadyRegistered`. However, **one Object Type can span multiple datasets** via **Multi-Datasource Objects (MDOs)**, available only on Object Storage V2. Column-wise MDOs join distinct subsets of properties from different datasources on the shared primary key. Each property maps to exactly one datasource (no duplication allowed), except the primary key which must exist in every datasource.

### Column-to-property mapping is direct but selective

When you add a backing dataset, Foundry **automatically maps every column** to a property (you can discard unwanted ones). You can also manually map individual columns. The mapping is essentially **1:1 — each property maps to one column** in one backing dataset. Transformations do not occur at the mapping layer; derived values are pre-computed in upstream pipelines (Code Repositories, Pipeline Builder) and added as columns before they reach the Ontology. The Ontology property schema (with rich metadata like display names, value formatting, validation rules) is **distinct from but derived from** the dataset schema (raw column names and Spark types).

### Dataset transactions follow a Git-like model

Foundry's dataset versioning model is described as **"Git for data."** Each change is an atomic transaction with four types: **SNAPSHOT** (replace entire dataset), **APPEND** (add new files — basis of incremental pipelines), **UPDATE** (add and overwrite files), and **DELETE** (remove file references without physical deletion). Datasets support branches for collaboration. The Object Data Funnel in Object Storage V2 reads transactions and incrementally indexes them into object databases, supporting tens of billions of objects per type and streaming datasources for low-latency updates.

---

## 3. Extracting the full ontology definition

There are three complementary approaches to export ontology metadata — the schema definitions for all 251 Object Types, their properties, Link Types, and Action Types.

### Ontology Manager JSON export is the most complete option

Navigate to Ontology Manager → Advanced settings → **Export**. This produces a **JSON file containing the entire ontology working state**: all Object Types, Link Types, Action Types, property definitions, and their configurations. This JSON can be edited in a code editor and re-imported to another ontology. One limitation: conditional formatting rules configured on properties cannot be imported to a different ontology.

### The `fullMetadata` API endpoint returns everything in one call

The single most valuable API endpoint for migration is:

```
GET /api/v2/ontologies/{ontology}/fullMetadata?preview=true
```

This **preview endpoint** returns all metadata in one request — Object Types, Link Types, Action Types, Query Types, Interface Types, and Shared Property Types. The response structure:

```json
{
  "ontology": { "apiName": "...", "rid": "...", "displayName": "..." },
  "objectTypes": { "<ObjectTypeApiName>": { /* full type metadata */ } },
  "actionTypes": { "<ActionTypeApiName>": { /* action definition */ } },
  "queryTypes": { "<QueryTypeApiName>": { /* query definition */ } },
  "interfaceTypes": { "<InterfaceTypeApiName>": { /* interface */ } },
  "sharedPropertyTypes": { "<SharedPropertyTypeApiName>": { /* shared props */ } }
}
```

Palantir notes this endpoint is "designed to return as much metadata as possible in a single request to support OSDK workflows" and may omit certain entities rather than failing. Authentication requires a Bearer token with OAuth scope `api:ontologies-read`.

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://tob.palantirfoundry.com/api/v2/ontologies/{ontology}/fullMetadata?preview=true" \
  | python -m json.tool > ontology_schema.json
```

### Individual metadata endpoints for granular access

If you need finer control or the bulk endpoint omits data:

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v2/ontologies` | List all ontologies |
| `GET /api/v2/ontologies/{ontology}/objectTypes` | List all Object Types (paginated, default 500) |
| `GET /api/v2/ontologies/{ontology}/objectTypes/{type}` | Get full type definition including all properties |
| `GET /api/v2/ontologies/{ontology}/objectTypes/{type}/outgoingLinkTypes` | List outgoing Link Types for a type |
| `GET /api/v2/ontologies/{ontology}/actionTypes` | List all Action Types |
| `GET /api/v2/ontologies/{ontology}/queryTypes` | List all Query Types |
| `POST /api/v2/ontologies/{ontology}/loadMetadata` | Selective bulk load (specify exact types to retrieve) |

Each Object Type response includes `apiName`, `displayName`, `description`, `primaryKey`, `properties` (with data types, descriptions, RIDs), `status`, `rid`, `icon`, and `visibility`. Each Link Type response includes `apiName`, `objectTypeApiName` (target), `cardinality`, and `foreignKeyPropertyApiName`.

### Python SDK for programmatic schema extraction

Install: `pip install foundry-platform-sdk`

```python
import foundry_sdk
import json, os

client = foundry_sdk.FoundryClient(
    auth=foundry_sdk.UserTokenAuth(os.environ["BEARER_TOKEN"]),
    hostname="tob.palantirfoundry.com",
)

# Option 1: Full metadata in one call
full_meta = client.ontologies.Ontology.get_full_metadata("your-ontology-name")

# Option 2: Enumerate individually with pagination
schema = {"objectTypes": {}, "linkTypes": {}, "actionTypes": {}}

for ot in client.ontologies.ObjectType.list("your-ontology-name"):
    schema["objectTypes"][ot.api_name] = vars(ot)
    links = list(client.ontologies.ObjectType.list_outgoing_link_types(
        "your-ontology-name", ot.api_name
    ))
    schema["linkTypes"][ot.api_name] = [vars(l) for l in links]

for at in client.ontologies.ActionType.list("your-ontology-name"):
    schema["actionTypes"][at.api_name] = vars(at)

with open("ontology_export.json", "w") as f:
    json.dump(schema, f, indent=2, default=str)
```

**Important distinction**: The **Platform SDK** (`foundry-platform-sdk` / `foundry_sdk`) is for metadata operations. The **OSDK** is a separately generated, per-ontology SDK for working with typed object data. For schema export, use the Platform SDK.

### What metadata is NOT accessible via API

The API returns type definitions, property schemas, action parameters, and link cardinalities. It does **not** expose: action rules/logic (which properties get modified and how), function source code (lives in Code Repositories), computed/derived property definitions, Workshop module configurations, Slate app configurations, Object View configurations, **backing dataset-to-property column mappings**, pipeline/transform definitions, action webhooks, or security/marking configurations. The backing dataset mapping gap is significant — you will need to determine which dataset RID backs each Object Type through the Ontology Manager UI or Data Lineage features.

---

## 4. Five methods to export the actual data

### Method 1: REST API v2 `loadObjectSet` — best for semantic preservation

The most powerful API endpoint for bulk export is:

```
POST /api/v2/ontologies/{ontology}/objectSets/loadObjects
```

This endpoint returns objects with full property names as defined in the Ontology (not raw column names), preserving semantic context. It uses **cursor-based pagination** via `nextPageToken`:

```python
import requests

TOKEN = os.environ["BEARER_TOKEN"]
HOSTNAME = "tob.palantirfoundry.com"
headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def export_all_objects(ontology, object_type):
    all_objects = []
    page_token = None
    while True:
        body = {
            "objectSet": {"type": "base", "objectType": object_type},
            "pageSize": 10000,
            "useSnapshotConsistency": True  # Prevents duplicates during pagination
        }
        if page_token:
            body["pageToken"] = page_token
        resp = requests.post(
            f"https://{HOSTNAME}/api/v2/ontologies/{ontology}/objectSets/loadObjects",
            headers=headers, json=body
        )
        data = resp.json()
        all_objects.extend(data.get("data", []))
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return all_objects
```

**Critical constraint**: On **Object Storage V1** (Phonograph), there is a hard cap of **10,000 objects total** across all pages per query — exceeding this returns `ObjectsExceededLimit`. **Object Storage V2 has no such limit.** Verify which storage version your 251 Object Types use. If any are on V1 and have more than 10,000 objects, you must use backing dataset export instead.

Throughput estimate: at ~1,000 objects per page with ~200ms latency, expect ~5,000 objects/second single-threaded. With 30 concurrent requests (the per-user limit), theoretical throughput reaches **100K–150K objects/second**. For 1.38M rows parallelized across 251 types, expect **5–15 minutes** total.

### Method 2: Direct dataset download via `readTable` API

This streams an entire backing dataset as CSV or Arrow format in a single request:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://tob.palantirfoundry.com/api/v2/datasets/{datasetRid}/readTable?branchName=master&format=CSV" \
  > output.csv
```

Parameters include `columns` (select specific columns), `rowLimit`, and transaction range filters. This is the **fastest method for raw data** but returns dataset column names, not Ontology property names — you lose semantic context and must reconstruct the mapping.

### Method 3: Foundry S3-compatible API — fastest for bulk Parquet

Foundry exposes datasets as S3-compatible buckets. You can pull Parquet files directly using standard S3 clients:

```python
import boto3

s3 = boto3.client(
    's3',
    endpoint_url='https://tob.palantirfoundry.com/io/s3',
    aws_access_key_id='<access-key>',        # From third-party app
    aws_secret_access_key='<secret-key>',
    region_name='foundry'
)

# List files in a dataset
response = s3.list_objects_v2(Bucket='ri.foundry.main.dataset.<uuid>')
for obj in response.get('Contents', []):
    s3.download_file('ri.foundry.main.dataset.<uuid>', obj['Key'], f"local/{obj['Key']}")
```

This is the **highest throughput option** — raw Parquet file transfer with no serialization overhead. Ideal for bulk migration of large datasets.

### Method 4: Foundry SQL via JDBC

Foundry SQL Server provides read-only SQL access to datasets. Connect via JDBC:

```
jdbc:foundrysql://tob.palantirfoundry.com?Token=<access-token>
```

Driver class: `com.palantir.foundry.sql.jdbc.FoundryJdbcDriver`. Supports DBeaver, Tableau, PowerBI, and any JDBC client. **Direct Read mode** (simple `SELECT *`) streams records directly from Parquet files without Spark overhead — very fast. Complex queries with filters, joins, or aggregates use **Spark SQL** and are slower but more flexible. Note: Array, Map, and Struct columns are not eligible for Direct Read.

### Method 5: Data Connection export to S3

For scheduled or ongoing exports, configure Data Connection exports: navigate to Data Connection → Source → Create export → select dataset → configure → schedule builds. Files are exported **as-is** (Parquet by default). For CSV output, first transform via a Code Repository. Supports incremental exports (only changed files since last export). This method is best for ongoing synchronization rather than one-time migration.

### Comparison matrix

| Criterion | REST API loadObjectSet | readTable API | S3-Compatible API | Foundry SQL | Data Connection |
|-----------|----------------------|---------------|-------------------|-------------|----------------|
| **Throughput** | ~5K obj/s (single-thread) | High (streaming) | Highest (raw files) | High (direct read) | High (bulk) |
| **Semantic preservation** | ✅ Ontology property names | ❌ Raw columns | ❌ Raw columns | ❌ Raw columns | ❌ Raw columns |
| **Row limits** | V1: 10K cap; V2: none | No hard limit | No limit | No hard limit | No limit |
| **Output format** | JSON | CSV or Arrow | Parquet (native) | JDBC ResultSet | Parquet (native) |
| **Setup complexity** | Low | Low | Medium (S3 creds) | Medium (driver) | Medium (config) |
| **Best for** | Ontology-aware export | Quick dataset dumps | Bulk data migration | Ad-hoc queries | Scheduled sync |

---

## 5. Reconstructing the semantic layer in PostgreSQL

When you export via backing datasets, you get flat tabular data. The ontology's semantic layer — type definitions, relationships, computed logic — must be reconstructed separately.

### Building the mapping document

Before exporting any data, extract the full ontology metadata using both the `fullMetadata` API and the Ontology Manager JSON export. Parse this metadata programmatically to create a mapping document:

- **Object Type → PostgreSQL table name**: Use the `apiName` field as the table name (it's already a clean programmatic identifier)
- **Property → column + type**: Map each property's `apiName` to a column name and translate the `baseType` to PostgreSQL (see type mapping table in Section 7)
- **Primary key → `PRIMARY KEY` constraint**: Use the `primaryKey` field from each Object Type definition
- **Link Type → FK or junction table**: For links with `cardinality: "ONE"` and a `foreignKeyPropertyApiName`, create a `FOREIGN KEY` constraint. For many-to-many links, create a junction table

### Reconstructing links as foreign keys

The Link Type metadata from the API includes the `foreignKeyPropertyApiName` — this tells you which column on the source Object Type serves as the foreign key referencing the target's primary key. For example, if the link metadata shows `{"apiName": "originAirport", "objectTypeApiName": "Airport", "cardinality": "ONE", "foreignKeyPropertyApiName": "originAirportId"}`, create:

```sql
ALTER TABLE flights
ADD CONSTRAINT fk_origin_airport
FOREIGN KEY (origin_airport_id) REFERENCES airports(airport_id);
```

For many-to-many links backed by join table datasets, you need to identify those backing datasets (via Ontology Manager or Data Lineage), export them, and create junction tables in PostgreSQL.

### What cannot be reconstructed from metadata alone

**Computed properties** backed by TypeScript/Python functions have logic that lives in Code Repositories, not in the Ontology metadata. You must either materialize them by running a transform that writes computed values to a dataset before export, or re-implement the logic as PostgreSQL generated columns, views, or application-layer code. **Action logic** — the rules defining what changes an action makes — is also not in the API response. Function-backed action code must be manually ported. **Value types** (semantic wrappers with validation regex and constraints) need re-implementation as PostgreSQL CHECK constraints or application-layer validation.

### DDL generation approach

```python
import json

TYPE_MAP = {
    "String": "TEXT", "Integer": "INTEGER", "Long": "BIGINT",
    "Double": "DOUBLE PRECISION", "Float": "REAL", "Boolean": "BOOLEAN",
    "Date": "DATE", "Timestamp": "TIMESTAMPTZ", "Byte": "SMALLINT",
    "Short": "SMALLINT", "GeoPoint": "geography(POINT, 4326)",
    "GeoShape": "geography(GEOMETRY, 4326)", "Attachment": "TEXT",
    "Struct": "JSONB", "Array": "JSONB", "Vector": "vector(2048)",
}

with open("ontology_export.json") as f:
    meta = json.load(f)

for type_name, type_def in meta["objectTypes"].items():
    cols = []
    for prop_name, prop_def in type_def["properties"].items():
        pg_type = TYPE_MAP.get(prop_def["baseType"]["type"], "TEXT")
        pk = " PRIMARY KEY" if prop_name == type_def["primaryKey"] else ""
        cols.append(f"  {prop_name} {pg_type}{pk}")
    print(f"CREATE TABLE {type_name} (\n" + ",\n".join(cols) + "\n);\n")
```

---

## 6. Limitations, gotchas, and what you cannot export

### Components that cannot leave Foundry

| Component | Exportable? | Notes |
|-----------|------------|-------|
| Backing dataset data | ✅ Yes | Via any of the 5 methods above |
| Ontology schema (types, properties, links) | ✅ Yes | Via JSON export + API |
| Pipeline source code | ⚠️ Partial | Code Repositories are Git-backed and can be cloned; orchestration/schedules cannot |
| Custom functions (TS/Python) | ⚠️ Partial | Source code clonable from Git repos; function registry metadata accessible via API |
| **Workshop app configurations** | ❌ No | Widget layouts, variable bindings, module configs have no export API |
| **AIP agent prompts** | ❌ No | Internal to AIP platform |
| **Automate monitors/schedules** | ❌ No | Platform-internal scheduling definitions |
| **Action rules/logic** | ❌ No | API returns parameters but not rule definitions |
| **Computed property logic** | ❌ No | Lives in Code Repositories |
| **Backing dataset-to-column mappings** | ❌ No | Not exposed in the public API |

### API rate limits and concurrency

Individual users are limited to **30 concurrent requests**. OAuth2 applications have no fixed concurrency limit. Requests exceeding limits receive **429** (rate limited) or **503** (service unavailable) responses — implement exponential backoff. Palantir does not publish fixed requests-per-minute numbers and states limits "may be subject to alterations." The `pageSize` parameter accepts values up to **10,000** but is treated as a suggestion. Developer Console applications are limited to **1,000 data resources and resource access scopes total**.

### Authentication for migration

For a one-time migration, a **User-Generated Token** (Settings → Tokens → Create token) is simplest but expires and auto-deactivates after 30 days of inactivity. For production or longer migrations, register an **OAuth2 Client Credentials** application in Developer Console — this creates a service user with programmatic access. Required OAuth scopes: `api:ontologies-read` for metadata and object data, `api:datasets-read` for direct dataset access, `api:mediasets-read` for media sets.

The service user **has no access by default** — a Foundry administrator must explicitly grant project access, ontology type access, and dataset read permissions to the service user.

### Time series data requires materialization

Time series data is stored in a **separate time series catalog**, not in the backing dataset. The backing dataset contains only a **series ID** column. To export actual time series values, you must use the **FoundryTS library** in a Python transform to materialize values into a standard dataset, then export that dataset. Derived series (computed on-the-fly) have no persistent storage and must also be materialized first.

### Media sets and attachments require separate downloads

**Media sets** (images, PDFs, videos) are stored separately from tabular data. Objects reference media via **media reference** properties containing `mediaSetRid` and `mediaItemRid`. Export requires enumerating items via `GET /api/v2/mediasets/{mediaSetRid}/items` and downloading content individually via `GET /api/v2/mediasets/{mediaSetRid}/items/{mediaItemRid}/content`. **Attachments** are different — they're lightweight file references by RID that are auto-deleted if unlinked within 1 hour. Both should be downloaded to external storage (S3, filesystem) with paths stored in PostgreSQL.

---

## 7. Foundry-to-PostgreSQL data type mapping

### Core type mapping table

| Foundry Type | PostgreSQL Type | Migration Notes |
|-------------|----------------|-----------------|
| String | `TEXT` | Direct mapping; prefer TEXT over VARCHAR in PostgreSQL |
| Boolean | `BOOLEAN` | Direct mapping |
| Byte | `SMALLINT` | PostgreSQL has no native byte type |
| Short | `SMALLINT` | Direct range match |
| Integer | `INTEGER` | Direct mapping |
| Long | `BIGINT` | Direct mapping |
| Float | `REAL` | Direct mapping |
| Double | `DOUBLE PRECISION` | Direct mapping |
| Decimal | `NUMERIC(p,s)` | Foundry default precision 38, scale 18; map directly |
| Date | `DATE` | Direct mapping |
| Timestamp | `TIMESTAMPTZ` | ⚠️ See precision notes below |
| Binary | `BYTEA` | Direct mapping (only at dataset level, not ontology property) |

### Complex and Foundry-specific types

| Foundry Type | PostgreSQL Type | Migration Notes |
|-------------|----------------|-----------------|
| GeoPoint | `geography(POINT, 4326)` via PostGIS | Stored as `"lat,lon"` string or `{longitude, latitude}` struct; parse with `ST_SetSRID(ST_MakePoint(lon, lat), 4326)` |
| GeoShape | `geography(GEOMETRY, 4326)` via PostGIS | Stored as GeoJSON string; parse with `ST_GeomFromGeoJSON()`. Without PostGIS, use `JSONB` |
| Attachment | `TEXT` + external storage | Store the RID/filename reference; download binary separately |
| Media Reference | `JSONB` + external storage | JSON structure with `mediaSetRid`, `mediaItemRid`, `mimeType` |
| Time Series | Separate table: `(series_id, timestamp, value)` | Must materialize via FoundryTS before export; no direct column mapping |
| Struct | `JSONB` | Preserves nested field names; alternatively flatten to separate columns |
| Array | `type[]` or `JSONB` | Native PostgreSQL arrays for simple types (e.g., `TEXT[]`, `INTEGER[]`); JSONB for arrays of complex types |
| Vector | `vector(n)` via pgvector extension | Requires pgvector; dimension n up to 2048 |
| Marking | `TEXT[]` or separate table | Security labels — no PostgreSQL equivalent; implement in application layer |
| Map | `JSONB` | Only at dataset level; cannot be an ontology property type |

### Precision and conversion gotchas

**Timestamps** in Parquet files follow Apache Spark conventions: stored as **microseconds since epoch**. The REST API returns ISO 8601 strings (`"2024-01-15T10:30:00.000Z"`). PostgreSQL `TIMESTAMPTZ` supports microsecond precision — **no precision loss**. However, always store with timezone awareness and ensure the Parquet reader correctly interprets the `isAdjustedToUTC` flag.

**GeoPoint** has two storage formats depending on context: a string `"57.64911,10.40744"` (latitude,longitude) in standard ontology properties, or a struct `{"longitude": float, "latitude": float}` in Pipeline Builder. Without PostGIS, store as two `DOUBLE PRECISION` columns (`latitude`, `longitude`). **GeoShape** must be valid GeoJSON Geometry (not Feature or FeatureCollection) with WGS 84 coordinates and counterclockwise polygon winding.

**Twenty CRM considerations**: Twenty CRM uses **UUIDs as primary keys** by convention. If your Foundry primary keys are integers or strings, you have two options: generate UUIDs and maintain a mapping table, or configure Twenty CRM to accept your existing key types. Twenty CRM stores relationship metadata in a specific `relation` structure — Foundry link types will need to be mapped to this format. Twenty CRM's workspace-scoped table architecture means each Foundry Object Type maps to a workspace table.

---

## Recommended migration execution plan

**Phase 1: Schema extraction (Day 1).** Run the `fullMetadata` API call and download the Ontology Manager JSON export. Parse both to build a complete mapping document: Object Type → table, property → column + type, link → FK or junction table. Generate PostgreSQL DDL and review.

**Phase 2: Data extraction (Days 2–3).** For each of the 251 Object Types, identify the backing dataset RID (via Ontology Manager UI or Data Lineage). Use the Foundry S3-compatible API to download Parquet files for maximum throughput — this is the fastest path for 1.38M rows. For types requiring ontology-semantic column names, use the REST API `loadObjectSet` endpoint with parallelization across types.

**Phase 3: Special data (Days 3–4).** Materialize any time series data using FoundryTS transforms. Download media set items and attachments to external storage. Export any many-to-many link join table datasets separately.

**Phase 4: Load and verify (Days 4–5).** Load Parquet/CSV data into PostgreSQL using `COPY` or pgloader. Add foreign key constraints based on link metadata. Verify row counts match per Object Type. Spot-check data integrity for complex types (GeoPoint parsing, timestamp precision, struct/array fidelity).

**Phase 5: Logic re-implementation (Ongoing).** Port computed properties to PostgreSQL views, generated columns, or application code. Re-implement action logic in your application layer. Rebuild validation rules that were encoded as Foundry value types. Map the 255 custom functions to equivalent application code — this is the most labor-intensive phase and cannot be automated from Foundry exports alone.