# Recovering incomplete 2.42 workflow mappings

Use this procedure when `upgrade:2-42:backfill-workflow-execution-core-ids` failed before the fixes in #26661, or when a workspace that already completed the upgrade contains an unmapped workflow. A newer binary does not automatically retry a failed migration or rerun a completed one.

## Diagnose before changing data

Check the deployed command implementation, rather than relying on the version displayed by a release dashboard. It must contain the orphan-version cleanup and parent relinking from #26661.

Use a read-only transaction with statement and lock timeouts to inspect:

- The latest migration attempt and workspace activation status.
- Both directions of the workflow and workflow-version mappings.
- Soft-deletion state of the projected workflow, projected version, and referenced runs.
- Whether an orphan core version has a live projected version referencing it.
- Whether a live unmapped workflow has a published version, versions, or runs.

Do not infer that a run is pending from its status alone: a `NOT_STARTED` run may already be soft-deleted. Do not assume a dangling non-null parent is covered by the 2.43 cleanup, which targets null parent IDs.

Two recoverable shapes covered by the regression suite are:

1. A soft-deleted workflow and version still reference an ACTIVE core version whose parent no longer exists. The backfill removes the orphan core version; it preserves the deleted projection and historical runs. It does not resurrect the workflow. A live projected version keeps the command failing instead of allowing this cleanup.
2. A live empty workflow has no core mapping and no existing reverse-mapped core workflow. The backfill creates its core mirror and writes the pointer back. It neither publishes the workflow nor creates versions or runs.

If the observed data differs, investigate the discrepancy instead of deleting rows or advancing the migration cursor manually.

## Review and run a scoped repair

Production execution requires the deployment owner's approval. Confirm recovery coverage and retain a restricted before-state export of the affected definitions, identifiers, and historical run references. Do not publish customer data or workspace identifiers in an issue or PR.

Run one command at a time on the command runner, with an explicit workspace ID. Never omit `-w`: omission applies the command to all provisioned workspaces.

First, after approval, validate the full command against that workspace:

```bash
yarn command:prod upgrade:2-42:backfill-workflow-execution-core-ids \
  -w <workspace-id> --dry-run --verbose
```

This is a transactional dry run, not a read-only query: it executes writes and rolls them back. It can acquire locks and should not be treated as a harmless production SELECT. Cache recomputation is skipped on this path.

After checking the candidate changes, apply the same scoped command:

```bash
yarn command:prod:background upgrade:2-42:backfill-workflow-execution-core-ids \
  -w <workspace-id> --verbose
```

Verify the expected rows and mappings, unchanged historical runs and deletion flags, and a successful cache recomputation. The SQL transaction commits before cache recomputation; a cache error therefore does not imply that the data rolled back. Inspect state before retrying. The repair is idempotent for the two shapes described above.

A direct command invocation does **not** update `core.upgradeMigration`. For a workspace whose cursor was failed, separately review the remaining commands in the currently deployed 2.42 binary, then resume the normal upgrade for only that workspace:

```bash
yarn command:prod:background upgrade -w <workspace-id> --verbose
```

This reruns the failed step, records its successful attempt, and continues the remaining workspace commands. It is a broader action than the mapping repair and must be included in the approval scope. Perform it before deploying 2.43 if the intent is to finish only 2.42. An already-current workspace needs only the direct repair: a normal upgrade skips its completed command.

## Verify and recover

Check the database cursor directly, then allow the upgrade status cache and dashboard metrics to refresh. Confirm there are no new invalid mappings, newly activated workflows, changed historical runs, or continuing mapping errors for the affected records.

Before SQL commit, validation failures and dry runs roll back together. After commit, do not attempt a blind inverse: recreating an orphan ACTIVE core version can reintroduce the original failure. Use the reviewed before-state export and an explicit recovery plan if an unexpected change is detected; database point-in-time recovery is a fallback, not an automatic rollback command.

## Remaining runtime question

An empty projected workflow can persist if core synchronization fails after its creation commits: workflow creation uses a post-query hook, and transactional post-query hooks run after commit. An update listener validates existing mappings and does not create a missing one. This explains why the broken shape can persist, but does not establish the original failure for an individual record. Use retained creation errors before attributing a historical incident to a specific trigger. These recovery tests do not claim to make workflow creation atomic or to prove that the original failure cannot recur.
