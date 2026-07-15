# Universal Identifiers

## Two distinct identifier systems

The Executive Search OS uses two independent identifier systems that must never be confused.

### Twenty metadata `universalIdentifier`

Twenty uses UUID v4 values as stable, immutable identifiers for all metadata entities (objects, fields, indexes, views, roles, agents, etc.). Rules from `packages/twenty-shared/src/metadata/constants/standard-object.constant.ts`:

- **Never mutate** an existing universal identifier.
- **Deleting** is very rare and requires migration.
- **System field** identifiers (id, createdAt, updatedAt, deletedAt, createdBy, updatedBy, position, searchVector) are **deterministically derived** via UUID v5 over a namespace — never hand-authored. See `build-standard-object-system-fields.util.ts` and `get-field-universal-identifier.util.ts`.
- The standard application UID is the fixed constant `20202020-64aa-4b6f-b003-9c74b97cee20`.
- Sibling deterministic-identifier utilities exist for agents, views, view-field-groups, navigation-menu-items, front-components, search-fields, connection-providers, command-menu-items, and view-sorts.

### Directus record IDs and `ats_uuid`

Directus uses its own primary keys (typically auto-increment integers or UUIDs) plus integration-specific identifiers:

- `executives.ats_uuid` — record-level integration identifier for executives.
- `companies.ats_uuid` — record-level integration identifier for companies.
- `opportunities.ats_uuid` — record-level integration identifier for opportunities.

These are **not** Twenty metadata `universalIdentifier` values. They are **not** Twenty record UUIDs. They are external integration keys.

## Identity linking

### `externalEntityLink` ledger

A durable core-standard record links Twenty records to external system records:

| Field                             | Description                                |
| --------------------------------- | ------------------------------------------ |
| `system`                          | `DIRECTUS` (future systems)                |
| `workspaceId`                     | Twenty workspace                           |
| `externalCollection`              | Directus collection name                   |
| `externalId`                      | Directus record ID                         |
| `twentyObjectUniversalIdentifier` | Twenty object metadata UID                 |
| `twentyRecordId`                  | Twenty record UUID                         |
| `externalNaturalKey`              | Natural business key (e.g., email, domain) |
| `sourceVersion`                   | Source system version                      |
| `sourceUpdatedAt`                 | Source timestamp                           |
| `sourceHash`                      | Content hash                               |
| `lastInboundSyncAt`               | Last inbound sync time                     |
| `lastOutboundSyncAt`              | Last outbound sync time                    |
| `syncStatus`                      | Current sync state                         |
| `conflictStatus`                  | Conflict state                             |
| `lastErrorCode` / `lastErrorAt`   | Error tracking                             |
| `isAuthoritativeLink`             | Whether this is the authoritative link     |
| `metadata`                        | Additional context                         |

### Unique indexes

- `(workspaceId, system, externalCollection, externalId)` — one link per external record.
- `(workspaceId, system, twentyObjectUniversalIdentifier, twentyRecordId)` — only one authoritative link per Twenty record per system.

### ATS UUID rules

1. Use `ats_uuid` when it exists and is valid.
2. The integration process may set `ats_uuid` to the relevant Twenty record UUID **after explicit verification**.
3. **Never overwrite a non-null `ats_uuid`** until ownership and identity have been validated.
4. Ambiguous identity matches enter a human review queue — no automatic overwrite.
5. One Directus executive resolves to one Twenty `person` and one `executiveProfile`.

## Collision policy

- Twenty metadata UIDs are derived deterministically within their namespace — collisions are structurally impossible by construction.
- `ats_uuid` values are verified before use; ambiguous or duplicate matches are routed to human resolution.
- `externalEntityLink` unique indexes prevent duplicate links at the database level.
