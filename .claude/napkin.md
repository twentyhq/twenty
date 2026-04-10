# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Deployment & Production Promotion

1. **[2026-03-20] Run pre-flight audit before every production push**
   Do instead: before any git/Railway action, run `diff-environments.py` + `run-migrations.py --status` + check version delta. Write a deployment plan and confirm with user before proceeding.

2. **[2026-03-20] TypeORM migrations and cache invalidation are unconditional**
   Do instead: always run `yarn database:migrate:prod` and `cache:flat-cache-invalidate --all-metadata` after every production deploy — even if you think nothing changed. They are idempotent.

3. **[2026-03-20] Post-deploy diff must be clean before marking done**
   Do instead: re-run `diff-environments.py` and `run-migrations.py --status` after all migrations. Deployment is not complete until both show zero gaps / all APPLIED.

## Metadata & View Configuration

1. **[2026-03-26] Record detail layout uses pageLayout → tab → widget → viewFieldGroup → viewField**
   Do instead: use the `manage-record-layout` skill. viewField rows with viewFieldGroupId=NULL are silently ignored when the view uses groups. Always assign viewFieldGroupId. Flush cache after any change.

2. **[2026-03-26] backfill-page-layouts can leave duplicate fields (FIELD cards + FIELDS widget)**
   Do instead: before touching a record layout, inspect via Step 2 of manage-record-layout skill. If a field appears in both a FIELDS widget group and as a standalone FIELD card widget, delete one of them.

3. **[2026-03-20] Default table view columns are shared across all users**
   Do instead: the default view (key=INDEX, type=TABLE, visibility=WORKSPACE) is workspace-wide — changing it affects everyone. Script column config in a migration using `client.get_views()` / `create_view_field()` / `update_view_field()` (see migrate-metadata skill).

4. **[2026-03-20] Default view row is created lazily on first UI visit**
   Do instead: if `client.get_views()` returns empty for a new object, the user hasn't opened the list view yet. Skip gracefully and re-run the migration after first visit.

5. **[2026-03-20] Views are data, not metadata — not covered by object/field migration scripts**
   Do instead: view column configuration (viewField rows) must be scripted separately using the view methods in meta_client.py. They survive code deploys but can be overwritten by `upgrade` commands.

## Shell & Command Reliability

1. **[2026-03-20] `railway ssh` not `railway run` for in-container commands**
   Do instead: always use `railway ssh --service <name> --environment <env> -- "<cmd>"`. `railway run` executes locally and fails with "Cannot find module".

2. **[2026-03-26] Railway SSH does not support stdin piping**
   Do instead: to run a SQL file, capture base64 as a variable and embed it in the SSH command:
   `B64=$(base64 -w0 /tmp/file.sql)` then `railway ssh ... -- "printf '%s' '$B64' | base64 -d > /tmp/r.sql && psql \"\$PG_DATABASE_URL\" -f /tmp/r.sql"`.
   The `base64 |` pipe approach writes 0 bytes on the remote side.
