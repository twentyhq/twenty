# Schema Drift Policy

## Evidence fingerprint vs schema fingerprint

The evidence-document SHA-256 hashes recorded in `sources/source-manifest.json` prove **source provenance** (which documents were used to build the inventory). They are **not** a Directus schema fingerprint.

The actual Directus schema fingerprint is currently `UNKNOWN_PENDING_SCHEMA_SNAPSHOT` because no raw schema snapshot was available.

## Snapshot acquisition

When a raw Directus schema snapshot becomes available:

1. Acquire via read-only API (`/schema/snapshot` endpoint) or SQL dump.
2. Compute a content-addressed fingerprint (SHA-256 of canonical schema JSON).
3. Store in `directusSchemaFingerprint`.
4. Set `rawDirectusSchemaAvailable: true`.

## Drift detection

A contract test compares the current snapshot fingerprint against the last recorded fingerprint. Drift classes:

| Class                  | Detection                                     | Action                                         |
| ---------------------- | --------------------------------------------- | ---------------------------------------------- |
| **Collection added**   | New collection in snapshot not in inventory   | Report; do not auto-sync; require review       |
| **Collection removed** | Collection in inventory missing from snapshot | Report; mark as potentially deprecated         |
| **Field added**        | New field on existing collection              | Report; unknown-field tolerance ignores safely |
| **Field removed**      | Known field missing                           | Report; may break sync projections             |
| **Type changed**       | Field type differs                            | Breaking change; block sync; require review    |
| **Constraint changed** | Nullability/uniqueness/relation changed       | Breaking change; block sync; require review    |

## Governance preservation

Future snapshot enrichment updates only observed-schema wrapper fields (type, nullability, constraints, relations). Curated governance decisions — ownership, classification, retention, AI eligibility, deny rules — remain byte-stable. The snapshot enriches but cannot overwrite them.

## CI contract (future)

When the sync bridge is implemented (PR4+), the drift contract test runs in CI:

1. Fetch current Directus schema snapshot.
2. Compare fingerprint to recorded fingerprint.
3. If drift detected, produce a human-readable diff.
4. Block deployment on breaking changes.
5. Allow deployment on additive changes only after review.

## Unknown-field handling

Unknown fields (fields in Directus not mapped in Twenty) are:

- Ignored safely during event processing.
- Included in drift reports.
- Never cause sync failure.
- Reviewed before mapping.
