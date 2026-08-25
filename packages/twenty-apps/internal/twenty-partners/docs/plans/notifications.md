# Notifications — daily partner digest + instant admin ping

Status: in delivery. CHANGE: the dump/seed mechanism is dropped (user decision) — the Daily Digest is rebuilt by hand in prod from the runbook. The list-digest-recipients step was reverted (327accad89): the validated build resolves recipients with Find Records + a person search instead.
Decisions made in session: digest = seeded workflow hack · admin ping = additive logic function.

## Context

Two notification gaps hold back the 48h brief-to-intro SLA:

1. **Partners learn about new briefs late or never.** The Daily Digest exists only as a
   runbook (`src/workflows/README.md`) that an admin must hand-build in every workspace.
   Prod has no digest until someone follows it.
2. **Admins are only pinged for form-submitted briefs.** `notifyClientBrief` runs inside
   the public intake route. A brief listed any other way (manual `isListed` tick on a TFT
   import, relist) notifies nobody.

### Platform facts that shaped the design (verified in twenty-server source)

- Logic functions support `cronTriggerSettings: { pattern }` — cron ships in the manifest.
- **No email path exists for an app token.** The only email mutation, `sendEmail`
  (`message-outbound-manager/resolvers/send-email.resolver.ts`), throws
  `ForbiddenException: This endpoint requires a user context. API keys are not supported.`
  via `@AuthUserWorkspaceId()`, and additionally requires the connected mailbox to belong
  to the calling user. `sendEmailViaDomain` has a DTO but no resolver.
- The workflow **Send Email action** runs inside the workflow executor with a
  workspace-only context — it is the platform's one app-compatible email path.
- `activateWorkflowVersion` (`core-modules/workflow/resolvers/workflow-trigger.resolver.ts`)
  has **no user guard**: an API-key caller holding the `WORKFLOWS` permission flag can
  activate a workflow version. (`runWorkflowVersion` does have `UserAuthGuard` — dead end.)
- Workflows are ordinary workspace records (`workflow`, `workflowVersion` with trigger and
  steps JSON), creatable through the core API.
- `Partner` has no email field, and the workflow **Find Records step loads no relations**
  (`find-records.service.ts` — own columns only), so a workflow cannot reach
  `partnerUser.userEmail` on its own. The app closes the gap with a
  **workflow-action logic function** (`workflowActionTriggerSettings` in the SDK;
  executed by `logic-function.workflow-action.ts`): `list-digest-recipients` returns
  `{ recipients: [{ email, name }] }` for validated partners with a linked account, the
  workflow Iterator loops over that array (the iterator accepts any array variable), and
  Send Email uses `{{currentItem.email}}`. Partners without an account are skipped by
  construction.

## Feature 1 — Daily Digest, seeded by the app

One email per validated partner per day: how many new briefs landed, link to the partner
workspace. **Zero new briefs → no email.**

### Mechanism

The app seeds the workflow at install time instead of asking an admin to build it.
Same script family as `src/scripts/configure-partner-rls.ts`, run with the admin API key
(admin role carries the `WORKFLOWS` flag).

**Phase A — hand-build once, dump as template**
1. Build the Daily Digest workflow by hand in the local workspace: cron trigger
   (daily, 07:00), Find Records on Opportunity (`isListed = true`, `createdAt` in the
   last day), Stop step when the count is zero, the app's **List digest recipients**
   step, Iterator over its `recipients` output + Send Email with
   `to = {{currentItem.email}}`. The recipients step ships in the app before the build.
   The email copy (subject, body with `{{count}}` and the workspace link) is written here
   and travels inside the template.
2. Dump the resulting `workflowVersion` record (trigger + steps JSON) via the core API.
   Store it as `src/scripts/templates/daily-digest.workflow.json`.

Prerequisite for the Send Email step: a mailbox connected to the workspace (OAuth or
IMAP/SMTP). Connecting it is a one-time human action per workspace — credentials are
never scripted.

**Phase B — seed script**
`src/scripts/seed-daily-digest-workflow.ts`:
1. Query `connectedAccounts`; abort with a clear message when none exists
   ("connect a mailbox first").
2. Idempotency: find a workflow named `Daily Digest`; when an active version already
   exists, exit as a no-op (re-seed after upgrades via a `--force` flag that deactivates
   and replaces).
3. Create the `workflow` record, create the `workflowVersion` from the template with the
   connected account id injected into the Send Email step.
4. Call the `activateWorkflowVersion` mutation. Activation registers the cron.
5. Update `src/workflows/README.md`: Daily Digest section becomes "seeded by
   `seed-daily-digest-workflow.ts`; prerequisite: one connected mailbox". Mark as Winner
   stays manual.

### Risks (accepted)

- The steps JSON is an internal format with no compatibility promise. A Twenty upgrade can
  break the seeded workflow. Mitigation: the template comes from a real hand-built
  workflow; after an upgrade, rebuild, re-dump, re-seed with `--force`.
- The digest reaches only validated partners with a workspace account (22 of 29 today).
  Accepted: the mail points at the workspace, so the others could not act on it anyway.

### Validation

- Run the seed against the local workspace; verify the version is active.
- For an end-to-end check without waiting a day: temporarily set the cron to every
  minute during validation, or run the version once with a user token
  (`runWorkflowVersion` accepts users).
- Check: a day with 0 new briefs sends nothing; a day with N sends one mail per
  validated-with-account partner containing N.

## Feature 2 — instant admin ping when a brief is listed (additive)

Keep the existing rich in-route Discord ping for form submissions. Add one logic function
for the path it misses.

### Why no double ping

Form briefs are born with `isListed: true` — they never *flip*, so only the in-route ping
fires for them. Hand-listed briefs are born unlisted and flip later — only the new
function fires for them. Each brief takes exactly one road.

Known gap, accepted: a brief created *already listed* by a future non-form path would ping
nobody. No such path exists today.

### Files

- `src/modules/opportunity/matching/on-opportunity-listed.logic-function.ts` — new.
  Pattern copied from `on-opportunity-intro-sent.logic-function.ts`:
  `databaseEventTriggerSettings: { eventName: 'opportunity.updated', updatedFields: ['isListed'] }`.
  Guard: fire only when `before.isListed !== true && after.isListed === true`.
  New universal identifier in `src/constants/universal-identifiers.ts`.
- `src/modules/opportunity/matching/services/notify-listed-brief.service.ts` — new.
  One list-form query (filter `id eq`, `first: 1`, edges — never the single-record read)
  loading the opportunity with company name, point-of-contact name, referred-by partner
  name. Builds a record-based embed: title "Brief listed on the marketplace", `need` as
  description (truncated), Company / Contact / Referred-by fields, `requirements`
  truncated, deep link to the record. Posts via the existing Discord connector
  (`postWebhook`, `DISCORD_WEBHOOK_ENV_VAR`, `TWENTY_BLUE`). Best-effort: any failure is
  swallowed; a Discord outage never fails the trigger.
- `submit-client-brief.service.ts`, `notifyClientBrief`, `brief-embed.mapper.ts` —
  untouched.

### Tests

- Fires on `isListed` false → true; posts one webhook with the record's data.
- Silent on true → false, and on a payload whose `after` is missing.
- Webhook failure (throw or timeout) returns normally.
- Missing opportunity (empty edges) returns normally — regression for the throw-trap class.

## Out of scope

- Notification when a partner applies to a brief (identified gap, separate feature).
- Any change to the Mark as Winner workflow.
- Emailing partners without a workspace account.

## Delivery

- Feature 2 is pure app code: version bump + `yarn twenty apply`, live-check on the local
  workspace (hand-list a record → one ping; submit the form → one ping, unchanged).
- Feature 1 lands as script + template + README change in the same package; prod needs
  the mailbox connected, then one seed run.
