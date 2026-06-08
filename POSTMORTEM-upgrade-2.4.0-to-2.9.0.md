# Postmortem — Self-host upgrade v2.4.0 → v2.9.0 fails (May 18 – Jun 5, 2026)

## Summary
A premium customer (**Bayer**) could not upgrade their self-hosted instance from **v2.4.0** to **v2.9.0**; several community self-hosters hit the same wall. The upgrade aborted at workspace step 72 (`2.5.0_NormalizeCompositeFieldDefaults`) during the **workspace cache recomputation that runs before any schema migration**, with one of two errors depending on the target image:
1. `column ViewFilterEntity.relationTargetFieldMetadataId does not exist` (→ v2.6.2)
2. `Cannot read properties of undefined (reading 'universalIdentifier')` (→ v2.7.3)

## Impact
* Bayer blocked from upgrading; same failure hit multiple self-hosters.
* Upgrade aborts on startup: UI stuck on skeleton loaders, `/metadata` empty.
* Pinning back mid-upgrade left the cursor at `2.5.0 / Failed` — a "phantom future" state no shipped release could recover without manual `ALTER TABLE`.
* No data loss (failures happen before DB writes), but hours lost to snapshot restores.

## Timeline (UTC)
| Date | Event |
| --- | --- |
| 05-14 | v2.5.0 — [#20533](https://github.com/twentyhq/twenty/pull/20533) adds `relationTargetFieldMetadataId` to the entity but registers the column-add only as a late 2.6 command (latent ordering bug). |
| 05-18 | v2.6.0; [#20481](https://github.com/twentyhq/twenty/pull/20481) renames `permissionFlag`→`rolePermissionFlag` and drops the null-safe fallback (second crash planted). |
| 05-18 | v2.6.1 — [#20664](https://github.com/twentyhq/twenty/pull/20664) adds early 2.3 column-add; fixes clean path only. |
| 05-19 | [#20699](https://github.com/twentyhq/twenty/issues/20699): cursor-stuck instances still broken. [#20721](https://github.com/twentyhq/twenty/pull/20721) backports column-add to 2.4/2.5 — but the published v2.6.1 Docker tag was built without it. |
| 05-22 | [#20841](https://github.com/twentyhq/twenty/issues/20841) filed: v2.4.0→v2.7.3 surfaces the second (`universalIdentifier`) crash. |
| 06-05 | [#20841](https://github.com/twentyhq/twenty/issues/20841) closed: null-safe fallback restored + regression test. |

## Root cause
The workspace cache is recomputed **before** the schema migrations its queries depend on, so any drift between entity code and physical schema during the upgrade crashes the sequence. Two instances of that drift hit:
1. **Column read too early** — `WorkspaceFlatViewFilterMapCacheService` SELECTs `relationTargetFieldMetadataId`, added only by a later 2.6 command (`c938fbf4`).
2. **Null deref** — a refactor (`d13cc7c`) removed the `?? SystemPermissionFlag[flag]` fallback, so a relation the upgrade-proxy intentionally strips became `undefined.universalIdentifier`.
Made near-unrecoverable because the runner never re-runs commands behind the cursor, and the v2.6.1 Docker tag shipped without the merged fix.

## What we did
* [#20664](https://github.com/twentyhq/twenty/pull/20664) + [#20721](https://github.com/twentyhq/twenty/pull/20721): early/idempotent column-add backported to 2.3/2.4/2.5; restored null-safe fallback (closes [#20841](https://github.com/twentyhq/twenty/issues/20841)).
* Workaround for stuck instances: `ALTER TABLE core."viewFilter" ADD COLUMN IF NOT EXISTS "relationTargetFieldMetadataId" uuid;` then restart server + worker.

## Action items
* **Bayer:** stage every upgrade in a prod-mirroring dev environment before production.
* **Process:** always upgrade to the latest *patch* of the target version (several bugs were already fixed in patches).
* **Twenty:** cross-version upgrade CI replaying v2.3/v2.4/v2.5 baselines → latest.
* **Twenty:** automated check that entity column/relation changes ship with the required `IF NOT EXISTS` command and null-safe fallback.
* **Twenty:** recompute the workspace cache *after* schema migrations (root structural fix).
* **Twenty:** treat upgrade-blocking GitHub issues as high priority (defined SLA).
* **Twenty:** ship a `reset-failed-upgrade-state` CLI; build Docker tags from a branch with critical fixes cherry-picked.
