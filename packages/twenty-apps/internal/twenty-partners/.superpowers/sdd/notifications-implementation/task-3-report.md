# Task 3 report — Daily Digest hand-build

## Status
DONE_WITH_CONCERNS

Dump/seed from `notifications-implementation.md` Task 3 is cancelled. Later commits reverted `list-digest-recipients` (`327accad89`) and shipped the 1.8.0 runbook (`f58e6bd161`, `51723aa455`). Spec note: the digest is rebuilt by hand in each workspace; the dump template is not part of the app.

No `dump-daily-digest-workflow.ts`, no `daily-digest.workflow.json`, no `digest:dump` script. Nothing committed.

## What was done

Local partners workspace (`wt-clean-process-in-partners`) now has one workflow named **Daily Digest**, version `937e25fd-ef3f-4a64-950f-b013c6dce8df`, **ACTIVE**.

Shape matches `src/workflows/README.md`:

1. Cron trigger, daily 07:00 UTC (`DAYS`, `hour: 7`, `minute: 0`, `day: 1`).
2. Find Records `Search new opp` — Opportunity, `isListed = true` AND `createdAt` `PAST_1_DAY` (UTC), limit 200.
3. If/Else — continue only when `totalCount >= 1` (zero new briefs → no email).
4. Find Records `Search Partners` — `Validation Stage` is `VALIDATED`, limit 200.
5. Iterator over those partners. Inside the loop: Find Records `Search people partner` (Person whose Partner Id is `currentItem.id`), then Send Email to `first.emails.primaryEmail`.
6. Send Email uses the connected IMAP mailbox, subject/body carry the new-brief count, link is `https://partners.twenty.com`.

Also destroyed the incomplete GraphQL draft that this Task 3 run had created under the old LOGIC_FUNCTION design (`7e15db5f…`). Restored the name **Daily Digest** on the validated workflow (it had been renamed to **Daily Digest (legacy)** during that failed dump-plan build). Set `IS_MULTIWORKSPACE_ENABLED` back to false after the user-token edits.

## Checks run

- Core API read: exactly one workflow named `Daily Digest`; ACTIVE version is CRON 07:00 UTC; Send Email `connectedAccountId` is set; opportunity filters are Listed + PAST_1_DAY; partner limit is 200; body contains `partners.twenty.com`.
- Incomplete dump-plan workflow is gone.
- `http://localhost:2020` login origin works again after the multi-workspace revert.

No unit tests: this task is workspace metadata, not app source.

## Files created or modified (committed)

None. Live workflow only. Runbook already landed in Task 5 (`f58e6bd161`).

## Concerns for the reviewer

- Coordinator brief still asked for a dump script + template JSON. That path would re-introduce a mechanism the user dropped. Do not run Task 4 (`digest:seed`) against this branch.
- The inner If/Else on "person has an email" from the runbook is not a separate step. The outer If/Else stops the whole run at zero briefs. The iterator has `shouldContinueOnIterationFailure: true`, so a partner without a person email does not stop the rest.
- Send Email `connectedAccountId` is this local mailbox (`ed626f16-78a0-4cbb-85d8-bec091111af4`). Prod needs its own mailbox and a fresh hand-build from the runbook.
- Archived versions of Daily Digest still hold the old MANUAL / google.com / empty-mailbox test builds. Only `937e25fd` is ACTIVE.
