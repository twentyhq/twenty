# Repair activity history after initial company assignment

The normal 2.43 upgrade automatically runs `upgrade:2-43:repair-initial-company-targets` for existing provisioned workspaces, including self-hosted installations. Ship the initial-company reconciliation listener in the same release so new assignments are handled while historical gaps are repaired.

The command uses the available person timeline audit to find a single recorded company change whose previous company ID is explicitly null and whose new company is still the person's current company. It adds company targets for email/calendar participants imported before that assignment.

It skips contacts with absent, malformed, deleted, or multiple company-change audit entries; company moves; inactive source records; and activity imported after the assignment. Changes to other records linked onto a person's timeline do not count as that person's company changes. Audit retention and merged timeline entries limit what can be inferred: missing evidence is not proof that history is complete, and an audit-supported assignment is not a guarantee that every earlier company change was retained.

Existing company targets remain unchanged, including manual attribution and soft-deleted targets representing explicit removals. The repair only inserts missing company targets. It does not run general participant reconciliation or derive new person/opportunity targets. The upgrade cursor records completion and retries failed runs through the standard upgrade pipeline. The `down` method preserves repaired links because they cannot be safely distinguished from subsequent valid assignments.

No additional command is required for self-hosters following the normal upgrade process. For a scoped preview before rollout or an explicit rerun, from the server package:

```bash
yarn command:prod upgrade:2-43:repair-initial-company-targets --workspace-id <workspace-id> --dry-run
```

The preview reports the number of missing email-thread and calendar-event company links. Review the affected workspace's initial-assignment audit and counts, then apply the same scope:

```bash
yarn command:prod upgrade:2-43:repair-initial-company-targets --workspace-id <workspace-id>
```

Rerun the preview afterward. The remaining count should be zero for unchanged eligible records. Verify representative company timelines in the browser with target reads enabled, including manual links, explicit removals, and private activity. Broaden rollout only after the scoped repair and comparisons pass. Zero eligible candidates does not establish completeness for records with missing or ambiguous audit history.

Each SQL batch is atomic and capped at 5,000 inserts. Interrupting a run leaves completed batches in place; rerunning skips existing rows. Standard workspace iteration options support repeated `--workspace-id`, `--start-from-workspace-id`, and `--workspace-count-limit`. Omitting workspace selectors processes every provisioned workspace, so use explicit IDs for initial runs. Candidates are rechecked against current records on every batch; dry-run counts can change if normal activity continues between preview and execution.

The command writes directly to the target tables without emitting record events, following the existing target backfill convention. It does not change feature flags. Keep per-workspace flag rollback until the historical repair and rollout checks are complete.
