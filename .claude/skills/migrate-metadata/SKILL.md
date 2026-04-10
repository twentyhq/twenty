---
name: migrate-metadata
description: >
  Apply or create Twenty CRM metadata migrations — programmatically create/delete
  custom objects, fields, and relations across environments (UAT → Production)
  using the Twenty metadata GraphQL API. Use this skill whenever the user wants
  to add a new custom object or field to Twenty, replicate a data model change
  from UAT to production, or write a new migration script.
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

# migrate-metadata

Manage Twenty CRM data model changes as versioned, idempotent migration scripts.

## File locations

```
/home/clive/_Projects/stratum/scripts/
  run-migrations.py          # runner — discovers and runs all migrations in order
  meta_client.py             # MetaClient helper (metadata GraphQL API)
  migrations/
    001-account-group.py     # AccountGroup object + fields + relations
    002-company-subtype-cleanup.py  # subType on company; remove legacy parent fields
    NNN-description.py       # future migrations
```

## Scope

This skill covers **schema-level** changes via the Twenty metadata GraphQL API:
custom objects, fields, relations, and table view columns.

It does **not** cover record detail page layout (`pageLayout → viewFieldGroup → viewField`).
That data is not exposed by the metadata API and must be migrated with idempotent SQL
scripts via Railway SSH. See the `manage-record-layout` skill for the pattern.

---

## Running migrations

```bash
cd /home/clive/_Projects/stratum

# Dry run against UAT
TWENTY_API_KEY=<key> TWENTY_API_URL=https://twenty-uat-0a4c.up.railway.app/graphql \
  python3 scripts/run-migrations.py --dry-run

# Apply to UAT
TWENTY_API_KEY=<key> TWENTY_API_URL=https://twenty-uat-0a4c.up.railway.app/graphql \
  python3 scripts/run-migrations.py

# Apply to production
TWENTY_API_KEY=<key> TWENTY_API_URL=https://twenty-production-eea0.up.railway.app/graphql \
  python3 scripts/run-migrations.py

# Run a single migration
TWENTY_API_KEY=<key> ... python3 scripts/run-migrations.py --only 002-company-subtype-cleanup
```

All migrations are idempotent — safe to re-run. Steps already applied are skipped.

## API keys

- Stored in `/home/clive/_Projects/stratum/.env` as `TWENTY_UAT_API_KEY` and `TWENTY_PROD_API_KEY`.
- Generated inside the Twenty UI at **Settings → API & Webhooks → API Keys** — not in Railway variables.
- The default `TWENTY_API_URL` in `run-migrations.py` points to production.
- Keys expire ~90 days from issue. Regenerate in the UI if you get 401/Forbidden errors.

## Environment URLs

- **Production**: `https://twenty-production-eea0.up.railway.app`
- **UAT**: `https://twenty-uat-0a4c.up.railway.app`

## MetaClient API

```python
from meta_client import MetaClient

client = MetaClient(api_url, api_key)  # MUST be the /graphql URL (or bare base URL)
# ⚠️  Do NOT pass a /metadata URL — MetaClient appends /metadata internally,
#     so passing https://.../metadata results in double-appending (/metadata/metadata)
#     and a Forbidden error.

client.get_all_objects()              # → dict[nameSingular, {id, ...}]
client.get_object_fields(object_id)   # → dict[fieldName, {id, type, settings, ...}]
client.create_object(**kwargs)        # → {id, nameSingular}
client.create_field(**kwargs)         # → {id, name}
client.delete_field(field_id)         # → bool (False if already gone)
```

## Writing a new migration

1. Create `scripts/migrations/NNN-description.py` (next sequential number).
2. Define `MIGRATION_ID`, `DESCRIPTION`, and `run(client, dry_run=False)`.
3. Follow the idempotent pattern: check existence before create/delete.
4. **Always test on UAT first**, then run against production.

### Migration template

```python
MIGRATION_ID = 'NNN-description'
DESCRIPTION = 'What this migration does'

def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    # Example: add a field to an existing object
    target_id = objects.get('company', {}).get('id')
    fields = client.get_object_fields(target_id)

    if 'myNewField' in fields:
        print('  [skip] myNewField already exists')
    else:
        print('  [create] myNewField')
        if not dry_run:
            client.create_field(
                objectMetadataId=target_id,
                type='TEXT',
                name='myNewField',
                label='My New Field',
                isNullable=True,
            )
```

### createOneField — key parameters

| Parameter | Notes |
|---|---|
| `objectMetadataId` | UUID of the object to add the field to |
| `type` | `TEXT`, `NUMBER`, `BOOLEAN`, `DATE_TIME`, `SELECT`, `MULTI_SELECT`, `CURRENCY`, `LINKS`, `ADDRESS`, `EMAILS`, `PHONES`, `RELATION` |
| `name` | camelCase field name |
| `label` | Display label |
| `isNullable` | Usually `True` for custom fields |
| `options` | Required for SELECT/MULTI_SELECT — list of `{label, value, color, position}` |
| `relationCreationPayload` | Required for RELATION — see below |

### Creating a RELATION field

Relations are created via `createOneField` with `type='RELATION'` and a `relationCreationPayload`:

```python
client.create_field(
    objectMetadataId=from_object_id,  # the object that "owns" this side
    type='RELATION',
    name='myRelation',
    label='My Relation',
    isNullable=True,
    icon='IconBuilding',
    relationCreationPayload={
        'type': 'ONE_TO_MANY',          # or MANY_TO_ONE
        'targetObjectMetadataId': to_object_id,  # ID on the TARGET environment
        'targetFieldLabel': 'Label on target side',
        'targetFieldIcon': 'IconName',
    },
)
```

**Important**: `targetObjectMetadataId` must be the object ID on the **target environment** — always resolve via `client.get_all_objects()`, never hardcode.

Deleting one side of a relation pair automatically deletes both sides. Handle gracefully with `client.delete_field()` which returns `False` instead of raising when the field is already gone.

## Configuring default view columns

The default table view for each object (`key: INDEX`, `type: TABLE`, `visibility: WORKSPACE`) is
shared across all workspace users. Changes to it affect everyone. Users who want a different layout
create their own personal (`UNLISTED`) views.

View column configuration is **not** covered by object/field metadata migrations — it is workspace
data. To make view layouts reproducible (survives upgrades, DB resets, and new environments), script
them in a migration file using `MetaClient`'s view methods.

### How it works

```
object (nameSingular)
  └─ view (key=INDEX, type=TABLE)      ← the default shared table view
       └─ viewField (one per field)    ← isVisible, position, size per column
```

`fieldMetadataId` in each viewField is the same ID returned by `get_object_fields()`.

### Migration template — set visible columns for a default view

```python
MIGRATION_ID = 'NNN-configure-my-object-view'
DESCRIPTION = 'Set default table view columns for MyObject'

# Ordered list of (fieldName, size) for visible columns, in display order.
# Fields omitted here will be hidden (isVisible=False).
VISIBLE_COLUMNS = [
    ('name',        200),
    ('stageCustom', 150),
    ('amount',      120),
    ('closeDate',   130),
]


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()
    obj = objects.get('myObject')
    if not obj:
        print('  [error] myObject not found')
        return

    # Find the default table view
    views = client.get_views(obj['id'], key='INDEX', view_type='TABLE')
    if not views:
        print('  [skip] no default TABLE view found for myObject (may appear after first UI visit)')
        return
    view_id = views[0]['id']

    # Get current field metadata IDs
    fields = client.get_object_fields(obj['id'])

    # Get existing viewFields for this view (keyed by fieldMetadataId)
    existing = {} if dry_run else client.get_view_fields(view_id)

    visible_names = {name for name, _ in VISIBLE_COLUMNS}

    # Apply visible columns in order
    for position, (field_name, size) in enumerate(VISIBLE_COLUMNS):
        field = fields.get(field_name)
        if not field:
            print(f'  [error] field {field_name!r} not found — skipping')
            continue
        fid = field['id']
        if fid in existing:
            vf = existing[fid]
            if vf['isVisible'] and vf['position'] == position and vf['size'] == size:
                print(f'  [skip]   {field_name} (position={position}, size={size})')
            else:
                print(f'  [update] {field_name} → position={position}, size={size}, isVisible=True')
                if not dry_run:
                    client.update_view_field(vf['id'], isVisible=True, position=position, size=size)
        else:
            print(f'  [create] {field_name} → position={position}, size={size}, isVisible=True')
            if not dry_run:
                client.create_view_field(view_id, fid, is_visible=True, position=position, size=size)

    # Hide all other fields that have an explicit viewField row
    for fid, vf in existing.items():
        # find field name for this fid
        fname = next((n for n, f in fields.items() if f['id'] == fid), fid)
        if fname not in visible_names and vf['isVisible']:
            print(f'  [update] {fname} → isVisible=False')
            if not dry_run:
                client.update_view_field(vf['id'], isVisible=False)
```

### Notes

- The default view row is created lazily by Twenty the first time a user opens the object's list
  view in the UI. If the object was just created by a migration and no one has visited it yet,
  `get_views()` will return an empty list — the `[skip]` branch handles this gracefully.
- Re-run the migration after users have visited the view for the first time to apply the config.
- Fields not in `VISIBLE_COLUMNS` and not yet in `existing` don't need explicit `isVisible=False`
  rows — Twenty treats missing viewField rows as hidden by default.
- `position` is zero-indexed left-to-right in the table.
- `size` is pixel width. Typical values: 120 (narrow), 180 (default), 200–250 (wide).

## Discovering what's in UAT vs production

To find what custom fields/objects are missing between environments, query both metadata APIs:

```python
uatClient = MetaClient('https://twenty-uat-0a4c.up.railway.app/graphql', uat_key)
prodClient = MetaClient('https://twenty-production-eea0.up.railway.app/graphql', prod_key)

uat_fields = set(uatClient.get_object_fields(company_id_uat).keys())
prod_fields = set(prodClient.get_object_fields(company_id_prod).keys())

missing_in_prod = uat_fields - prod_fields
extra_in_prod = prod_fields - uat_fields
```
