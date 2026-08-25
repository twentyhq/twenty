# How the Partners app works

Orientation for an agent landing on this package cold. Coding conventions are not repeated here —
see the repo `AGENTS.md` / `CLAUDE.md` and `.cursor/rules/`.

`twenty-partners` is a Twenty SDK app installed on the `partners.twenty.com` workspace. It runs a
marketplace: a client posts a brief, partners bid on it, Twenty introduces two and picks a winner.

## The three-place split

| Where | What | Travels with `apply` / `install`? |
| --- | --- | --- |
| **App code** | objects, fields, views, roles, page layouts, logic functions, front components, command-menu items | yes |
| **Workspace metadata** | the two workflows, the connected mailbox | **no** — rebuilt by hand per workspace |
| **Local skills** | `partner-opps` (finds opportunities that need a partner), `twenty-partner-triage` (ranks the partner-application backlog) | no — run on an operator's laptop |

Why the split is not a style choice: **an application token has no email path.** `sendEmail`
(`message-outbound-manager/resolvers/send-email.resolver.ts`) is guarded by `@AuthUserWorkspaceId()`
and throws `ForbiddenException: This endpoint requires a user context. API keys are not supported.`
`sendEmailViaDomain` has a DTO and no resolver. The only app-compatible email path is the workflow
**Send Email** action, which runs in the workflow executor with a workspace-only context. Workflows
are ordinary workspace records and the SDK has no `defineWorkflow`, so the Daily Digest cannot ship.

Two automation attempts were tried and abandoned on purpose — do not re-propose them:
seeding the workflow from a dumped steps JSON (dropped: internal format, no compatibility promise),
and a `list-digest-recipients` workflow-action logic function (built, then reverted).

## Lifecycle

`Opportunity` = a brief. `Application` = one partner's candidacy on one brief. `isListed` decides
whether partners see and can bid on the brief.

1. Public form on twenty.com → `submitClientBrief` creates the Opportunity with `isListed: true`,
   `stage: NEW`, plus find-or-create Company and point-of-contact Person, and an optional
   `referredByPartner` resolved from `partnerSlug`. No human review before partners see it.
2. Or ops tick `isListed` by hand on an imported / relisted brief.
3. One Discord ping to the internal team channel (see Notifications).
4. Partners browse the **Open Briefs** view (`isListed IS true`). RLS keeps each partner's
   Application rows private (`partnerUser IS me` on `application`).
5. Daily Digest nudges validated partners once a day.
6. A partner applies: pinned command-menu item → front component → `POST /apply-to-brief`.
   In parallel, ops can push a brief at a partner directly by creating the Application themselves in
   state `INVITED`. Pull and push land in the same pool.
7. Ops set 2 applications to `INTRODUCED` (from `APPLIED` and `INVITED` alike), bulk-edit the rest to
   `BACKUP`.
8. Ops stamp `introSentAt` → `on-opportunity-intro-sent` sets `isListed: false`. The brief unlists
   and stops taking applications. Clearing the stamp is a no-op.
9. Ops set `Opportunity.partner` (directly, or via the *Mark as Winner* workflow from an Application)
   → `on-opportunity-partner-won` runs `syncApplicationOutcomes`.

### State model — `Application.state`, six values, default `APPLIED`

| State | Meaning | Writer |
| --- | --- | --- |
| `APPLIED` | applied to a public brief, waiting | apply route; `on-application-created` fallback |
| `INVITED` | the team pushed a brief at this partner directly (usually one not on the open marketplace) and they have not answered — the private-outreach twin of `APPLIED` | ops, via the intro skill |
| `INTRODUCED` | in the running, 2 per brief | by hand |
| `BACKUP` | applied or invited, not one of the 2 | by hand, bulk edit |
| `WON` | the winner | `on-opportunity-partner-won` |
| `DECLINED` | a loss **and** a partner's own refusal | `on-opportunity-partner-won`, or by hand |

Cascade on assign: winner → `WON`, every other application on the brief → `DECLINED`.
On unassign: `WON` and `DECLINED` reopen to `APPLIED`; `BACKUP` is deliberately untouched (it
predates the introduction). `DECLINED` conflating loss and refusal is a known, accepted cost.

`APPLIED` and `INVITED` are the same funnel step — a partner waiting on an answer — and differ only
by who started the conversation. Both are shortlisted to `INTRODUCED` the same way.

**One row per (opportunity, partner), never two.** `apply-to-brief.service.ts` runs
`findDuplicateApplication` before creating: a row that already has a pitch is refused with
`ALREADY_APPLIED`; a row with an empty pitch (the shape an invite produces) has its pitch
**filled in place** via `updateApplication`, returning that row's id and **leaving `state` untouched
at `INVITED`** — the state records that Twenty went to the partner first, and that history is worth
keeping. This only applies while the brief is listed: `introSentAt` unlists it, so `INTRODUCED` /
`WON` / `DECLINED` rows fail the earlier `isListed` check with `BRIEF_NOT_OPEN` and need no extra
guard.

## Notifications — three channels

**Discord is internal only.** Both pings go to the Twenty team's channel. Partners are never in it.
The only partner-facing notification is the digest email.

| Channel | Fires on | Where |
| --- | --- | --- |
| A — in-route ping | public form submission | `notify-client-brief.service.ts`, called at the end of `submitClientBrief`. 3s webhook timeout (runs inside a visitor request, must not eat the 15s budget). Failures swallowed. |
| B — listing trigger | `isListed` false → true | `on-opportunity-listed.logic-function.ts` → `notify-listed-brief.service.ts`. `databaseEventTriggerSettings: { eventName: 'opportunity.updated', updatedFields: ['isListed'] }`, guard `before?.isListed !== true && after.isListed === true`. Failures swallowed. |
| C — Daily Digest | cron, daily 07:00 | hand-built workflow. One mail per validated partner: count + workspace link, no brief details. **Zero new briefs → no email.** |

**Exactly one ping per brief, by construction, not by a lock.** Form briefs are born
`isListed: true`, so the field never flips and channel B never sees an update. Hand-listed briefs are
born unlisted and flip later, and there is no form request to ping from. Accepted gap: a brief
created *already listed* by a future non-form path pings nobody — no such path exists today.

## Rebuild per workspace

Instructions: **`src/workflows/README.md`** — source of truth, keep it updated.

| Workflow | Trigger | Action |
| --- | --- | --- |
| **Mark as Winner** | manual, single `Application` | Update Record on Opportunity: id `{{trigger.record.opportunity.id}}`, Partner = `{{trigger.record.partner.id}}` |
| **Daily Digest** | cron, daily 07:00 | Find Records (Opportunity, `PAST_1_DAY` + `isListed`) → Find Records (Partner, `VALIDATED`) → Iterator → Find Records (Person by `Partner → Id`) → If/Else on email → Send Email → Publish |

The inner Person search exists because the workflow **Find Records step loads no relations**
(`find-records.service.ts`, own columns only) and `Partner` has no email field. Raise the record
limit on every Find Records step — the editor default is 1.

*Apply to Brief* is **no longer** a hand-built workflow; it ships in the manifest. Any note saying
otherwise is stale.

Prod prerequisites:

- A connected mailbox (Settings → Accounts). Never scripted.
- App variables (Settings → Apps → Twenty Partners → Variables): `DISCORD_WEBHOOK_URL` (secret;
  empty = all Discord notifications silently disabled), `PARTNER_APP_FRONTEND_URL` (record links),
  `PARTNER_APPLICATION_SECRET` (the website route's `X-Application-Secret`).
- `yarn rls:configure:prod` after install. It asserts on drift and exits non-zero.
- Deploy with the `twenty-app-deploy` skill; never hand-run publish/install for prod.

Local email testing: smtp4dev on `host.docker.internal` (SMTP 2525, IMAP 1143, no TLS), with
`OUTBOUND_HTTP_SAFE_MODE_ENABLED` false. `EMAIL_DRIVER` is the system mailer — unrelated.

## Invariants

- **List-form reads only.** Never a single-record read: fetch with a filter on `id`, `first: 1`, and
  read `edges[0].node`, so a missing record is empty edges instead of a throw. Regressions of this
  class already shipped twice.
- **Universal identifiers are immutable.** Changing a UID recreates the record; keeping a stale one
  keeps a stale type. `src/constants/universal-identifiers.ts` records the case where only a fresh
  id forced a clean recreate of a view.
- **Notification code is best-effort.** Every Discord call site checks the env var, wraps in
  try/catch, and swallows. A webhook outage must never fail a trigger or a submitted brief.
- **RLS lives in a script, not the manifest** — `src/scripts/configure-partner-rls.ts`. It asserts
  the expected field locks and exits non-zero on drift.
- **`/apply-to-brief` is `isAuthRequired: false` on purpose.** With auth on, the executor intersects
  the caller's role with the app role, and the Partner role denies Application writes. The function
  verifies the forwarded `authorization` header itself and keeps an app-only token for the write.
- Vertical-slice modules; dependency direction is `logic-functions → services → graphql/connector`.

## File map

| Path | What |
| --- | --- |
| `src/application-config.ts` | app variables and their descriptions |
| `src/constants/universal-identifiers.ts` | UIDs + the notes on why some are frozen |
| `src/modules/opportunity/intake/services/submit-client-brief.service.ts` | public form path |
| `src/modules/opportunity/intake/services/notify-client-brief.service.ts` | channel A |
| `src/modules/opportunity/matching/on-opportunity-listed.logic-function.ts` | channel B trigger |
| `src/modules/opportunity/matching/services/notify-listed-brief.service.ts` | channel B embed |
| `src/modules/opportunity/matching/on-opportunity-intro-sent.logic-function.ts` | unlist on intro |
| `src/modules/opportunity/matching/on-opportunity-partner-won.logic-function.ts` | outcome cascade trigger |
| `src/modules/opportunity/matching/services/sync-application-outcomes.service.ts` | the cascade |
| `src/modules/opportunity/views/open-briefs.view.ts` | the marketplace view |
| `src/modules/application/apply/` | route, front component, command-menu item, service |
| `src/modules/application/objects/application.object.ts` | the six states |
| `src/modules/application/views/` | Applications, Applications by Opportunity, Pipeline, widget |
| `src/scripts/configure-partner-rls.ts` | row-level security |
| `src/workflows/README.md` | the per-workspace runbook |
| `docs/plans/brief-applications.md` | marketplace plan + prod baseline numbers |
| `docs/plans/notifications.md` | notifications plan + verified platform facts |
