# Workflow core execution rollout

Workflow execution is core-keyed independently of the workflow UI feature flag.
Workspace workflow and workflow-version rows are rollback projections; workflow
runs and business records remain workspace records.

## Rolling deployment

1. Run the 2.41 instance command that adds
   `core.workflowVersion.workspaceWorkflowVersionId`.
2. Run the workspace backfills. They populate the durable reverse version
   mapping, repair core IDs on existing runs, and make legacy run relations
   nullable for genuinely mirrorless core workflows.
3. Deploy workers before API and cron producers. During the overlap, workers
   accept both the old paired-ID trigger envelope and the new core-only
   envelope. Old envelopes are normalized through the core-owned mapping and
   never load workspace definitions.
4. Deploy API and cron producers. New automated-trigger jobs contain core IDs.
   Existing Redis cron entries remain readable until their TTL expires; the
   existing occurrence deduplication key remains stable for those entries.

Do not remove the compatibility mapping while delayed or form-waiting runs can
still reference rollback rows. Continuations remain run-keyed and execute the
flow snapshot stored on the run.

## Transitional billing policy

Mapped workflows keep their historical workspace workflow ID as the billing
spender. Mirrorless workflows use the core workflow ID. This avoids splitting
existing usage series while making new core-only definitions billable. A
historical billing-ID migration is deliberately outside this rollout.

## Remaining teardown

- Remove workspace workflow/version projection fields only after queued and
  delayed work has drained or all supported workers tolerate their absence.
- Remove legacy trigger-envelope decoding after the rolling-deployment window.
- Migrate historical billing series before removing workspace workflow IDs.
- Remove the workflow consistency monitor only after core-only read validation.
