# Repairing missing standard system fields before the 2.42 upgrade

If `SyncMessageRecordPageCommand` fails with `Field metadata not found` for
`5f2febe9-face-51bb-84df-110447e939c4`, the missing dependency is
`message.createdBy`. The page definition is valid; the workspace is missing a
standard system field and its physical columns.

The 1.19 system-field change (#17992) added `createdBy`, `updatedBy`, `position`
and `searchVector` to older standard objects. Some older workspaces still lack
that backfill. The later deterministic-identifier and system-side-effect
backfills only update existing fields, so successful execution of those commands
does not establish that the fields exist. The original 1.19 command has since
been retired. Existing upgrade records cannot establish why a particular
workspace missed that old command.

The message page introduced in #26153 displays `createdBy` in its System group.
Its tests mocked migration validation, and its dry run only counted operations;
neither tested a workspace missing this dependency. The cross-version CI starts
from a freshly provisioned v1.22 workspace, which already has the 1.19 fields.

In the dev investigation, all 13 reported workspaces were missing the same 54
fields still present in the current standard definitions. All were provisioned
before the February 2026 system-field change. The real migration builder rejected
the original page plan in all 13, accepted the repair plan, and accepted the
combined repair/page plan. These checks used read-only PostgreSQL connections,
`dryRun: true`, and a disabled migration executor; they did not execute schema
changes.

## Recovery

With the repair available in the deployed command runner, run:

```sh
node dist/command/command.js upgrade:2-42:backfill-missing-standard-system-fields --dry-run
node dist/command/command.js upgrade:2-42:backfill-missing-standard-system-fields
node dist/command/command.js upgrade
```

The usual `-w <workspace-id>` option can restrict the repair to a canary before
running it across provisioned workspaces. Inspect the command result before
proceeding; validation and execution failures remain errors.

The explicit repair is necessary for a workspace already blocked on the earlier
message-page command: the sequence stops at that failure and cannot reach a new
command appended after it. The repair does not advance the upgrade cursor.
The subsequent normal upgrade retries the failed page command and eventually
records the repair command as completed. Existing migration logic and timestamps
are preserved.

The repair creates only the four historical system fields that are missing on
existing standard objects, using their current standard definitions and the
normal validated metadata/schema migration service. It leaves existing fields
and customizations unchanged, does not create absent objects, and does not
silently accept conflicting metadata. Its dry run performs real validation
without executing migrations. Rerunning it is a no-op once fields are present.
Rollback deliberately retains these required fields and any data written to them.

Validation reports are already stored in `core.upgradeMigration.errorMessage`.
The workspace iterator now also prints them on builder failures, including the
metadata identifiers and validation messages.

## Agent history

`Agent streams are still active` is a separate cutover guard. The upgrade recovers
expired stream leases but refuses to copy and switch history while active streams
remain. Let them finish or cancel them normally, then retry the upgrade. Do not
clear stream IDs or bypass the guard to force cutover.
