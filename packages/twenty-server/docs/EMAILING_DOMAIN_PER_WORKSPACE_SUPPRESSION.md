# Email-Group (SES): Per-Workspace Suppression, Events, Rate Limits, Enterprise Gate

## Problem

SES suppression list is **account-level only** — one shared list per AWS account/region. Config-set
`SuppressionOptions.SuppressedReasons` only toggles whether a reason feeds/honors that one shared list.
So a hard bounce in workspace A silently blocks sends to the same address in workspace B. SES "tenants"
isolate reputation and sending-pause, **not** suppression.

Second defect: SES allows only **one contact list per account** (max 20 topics). The current
per-workspace `CreateContactListCommand` works for workspace #1 and fails for #2. Unsubscribe must be
app-owned, not SES-list-owned.

## Scope (v1)

- Per-workspace suppression, **GLOBAL scope only**. No campaign/topic-level scope — no campaign entity
  exists and transactional-vs-marketing split is coming via a workspace transactional channel type, not
  via suppression scope.
- Three actionable SES event types: `HARD_BOUNCE` (Permanent bounce only) + `COMPLAINT` → suppress;
  `SUBSCRIPTION` → unsubscribe. All other 7 event types are telemetry.
- Soft bounces arrive as `DeliveryDelay`, not `Bounce` — never suppressed.

---

## 1. Per-workspace suppression

### Entity

`EmailGroupSuppressedRecipientEntity` → table `core.emailGroupSuppressedRecipient`. Schema was
revised after a durability simulation — see
`EMAILING_DOMAIN_SUPPRESSION_DESIGN_REVIEW.md` for why the naive single-row design fails (22.8% of
the event space) and why this one is verified correct (0%).

| column | type | notes |
|---|---|---|
| `id` | uuid | `@PrimaryGeneratedColumn('uuid')` |
| `workspaceId` | uuid | FK → workspace, `ON DELETE CASCADE` (via `WorkspaceRelatedEntity`) |
| `emailAddress` | varchar | normalized (trim + lowercase) |
| `scope` | enum | `GLOBAL` (bounce/complaint, all channels) \| `MARKETING` (unsubscribe, reversible) |
| `reason` | enum | `HARD_BOUNCE \| COMPLAINT \| UNSUBSCRIBE` |
| `status` | enum | `ACTIVE \| RELEASED` — resubscribe sets `RELEASED`, never deletes |
| `providerEventId` | varchar null | SES feedbackId/messageId for event-grain dedupe |
| `createdBySource` | enum | `FieldActorSource` — `WEBHOOK` for SES events, `API` for self-serve unsubscribe |
| `createdAt` | timestamptz | `@CreateDateColumn` |
| `updatedAt` | timestamptz | `@UpdateDateColumn` |

Constraint: `UNIQUE(workspaceId, emailAddress, scope)`.

Extend `WorkspaceRelatedEntity` (gives `workspaceId` + cascade `@ManyToOne` to `WorkspaceEntity`),
matching `EmailingDomainEntity`. Enum columns match the local `EmailingDomainTenantStatus` pattern
(TypeORM `enum` type), not string-literal columns.

Write rules (in `EmailGroupSuppressionService`):
- `suppress`: scope derived from reason (`UNSUBSCRIBE → MARKETING`, else `GLOBAL`); reactivating
  upsert on `(workspaceId, emailAddress, scope)` with `status = ACTIVE`. Scope separation keeps
  bounce/complaint and unsubscribe in distinct rows, so they never overwrite each other.
- `releaseMarketingSuppression`: sets `status = RELEASED` on the `MARKETING` row only; `GLOBAL`
  (permanent bounce/complaint) is never touched by a resubscribe.
- Read path (`getSuppressedAddresses`): returns addresses with any `ACTIVE` row. v1 is
  channel-agnostic (any active scope blocks); add a scope filter when the transactional channel
  type lands.

### Migration

Generate via CLI, never hand-write:

```
npx nx run twenty-server:database:migrate:generate --name addEmailGroupSuppressedRecipient --type fast
```

Auto-registers in `instance-commands.constant.ts`.

### Opt out of account-level list

In `aws-ses-register-domain.service.ts`, `CreateConfigurationSetCommand` currently sends
`SuppressionOptions: { SuppressedReasons: ['BOUNCE', 'COMPLAINT'] }`. Change to
`SuppressedReasons: []` so this config set neither feeds nor honors the shared account list. Suppression
becomes entirely app-owned.

Existing provisioned config sets need a one-time `PutConfigurationSetSuppressionOptionsCommand` backfill —
fold into the same instance command (workspace-scoped) or a follow-up.

### Enforce at send time

In `EmailingDomainService.sendEmail` (after tenant-status check, before driver send): query
`emailGroupSuppressedRecipient` for `workspaceId` where `emailAddress IN (lowercased to/cc/bcc)`. Filter
suppressed addresses out of each list. If **all primary `to` recipients** are suppressed → throw
(`ALL_RECIPIENTS_SUPPRESSED`). Partial suppression → send to survivors.

---

## 2. Handle actionable events

### Rip out broken contact-list code

- Remove `CreateContactListCommand` from `aws-ses-register-domain.service.ts` (breaks at workspace #2).
- Remove `ListManagementOptions: { ContactListName, TopicName }` from `SendEmailCommand` in
  `aws-ses-send-email.service.ts`.
- Drop the `AWS_SES_MARKETING_TOPIC_NAME` contact-list plumbing.

### Routing (extend existing path — do NOT build a new webhook)

EventBridge → SNS → `POST /webhooks/messaging/ses/outbound` → `SesOutboundWebhookRouterService` already
exists and consumes `SesEventBridgeNotification`, switching on `detail-type`. Today it handles only
`'Sending Status Enabled' | 'Sending Status Disabled'` → tenant pause.

As built:
1. Widened `SesEventBridgeNotification['detail-type']` to include `'Email Bounced'` and
   `'Email Complaint Received'` (the actual EventBridge envelope strings — verified against AWS docs;
   the SNS-style `detail.eventType` is `'Bounce'`/`'Complaint'`) plus the `detail.mail` / `detail.bounce`
   / `detail.complaint` payload fields.
2. Router dispatches by `detail-type`: sending-status → `SesOutboundSendingStateHandlerService`;
   `'Email Bounced'`/`'Email Complaint Received'` → new `SesSuppressionEventHandlerService`.
3. Handler suppresses via the Item-1 reactivating upsert. Suppress **only** `bounce.bounceType ===
   'Permanent'` (HARD_BOUNCE) and all complaints (COMPLAINT). `feedbackId` stored in `providerEventId`.
4. Workspace ID resolved from the `workspace` EmailTag (`detail.mail.tags.workspace[0]`, the exact id we
   set at send time), falling back to parsing the resource ARN.
5. `Subscription` events are moot once SES list management is removed (we no longer own an SES list);
   unsubscribe is handled entirely by the app endpoint below.

### twenty-infra reconciliation

Dangling uncommitted files (`ses-suppression-events.tf`, `sns-ses-suppression-events.tf`, per-route
`SES_SNS_TOPIC_*_ARN` env vars in `charts/*/values.yaml`) point at a route that never existed. Since
events ride the existing outbound topic/route, **delete** them rather than wire them up — unless the
existing outbound topic does not also carry Bounce/Complaint (verify the EventBridge rule → SNS topic
fan-out in twenty-infra before deleting).

### Unsubscribe (app-owned) — as built

SES list management is unusable (fact: one list/account). Own it:
- `EmailGroupUnsubscribeService` builds `List-Unsubscribe` + `List-Unsubscribe-Post:
  List-Unsubscribe=One-Click` (RFC 8058) headers, attached via `Content.Simple.Headers`
  (`MessageHeader[]` — supported in `@aws-sdk/client-sesv2@3.1001.0`; **no Raw MIME**).
- Token is a self-contained HMAC-SHA256 over `APP_SECRET` of `{workspaceId, emailAddress}`
  (base64url payload + signature, constant-time compare). No JWT key/token-type coupling, stateless
  verify. Never trusts raw query params.
- `EmailingDomainUnsubscribeController` exposes public `POST /emailing/unsubscribe` (one-click) and
  `GET /emailing/unsubscribe` (browser fallback); a valid token writes a `MARKETING`/`UNSUBSCRIBE`
  suppression row (`FieldActorSource.API`). Always returns 200 (no recipient-existence leak).
- Headers are attached **only** when the caller sets `includeUnsubscribe: true` **and** the message
  resolves to exactly one deliverable recipient (one-click targets a single address). v1 read path is
  channel-agnostic, so an unsubscribe blocks all sends for that address until the transactional channel
  type lands — transactional callers must leave `includeUnsubscribe` unset.

---

## 3. Rate limits + billing units

### Input caps (`send-email-via-domain.input.ts`)

Add `class-validator` decorators:
- `@MaxLength` on `subject`, `text`, `html`.
- `@ArrayMaxSize` on `to`, `cc`, `bcc`, `replyTo` (existing: only `@ArrayMinSize(1)` on `to`).

### Throttle — as built

- Reuses the existing `ThrottlerService.tokenBucketThrottleOrThrow`, keyed
  `emailing-domain-send:<workspaceId>`, consuming one token per deliverable recipient
  (`EMAIL_SEND_THROTTLE_MAX_RECIPIENTS` per `EMAIL_SEND_THROTTLE_WINDOW_MS`). Checked after the
  suppression filter, before the driver send.
- Hard per-message recipient cap (`EMAIL_MAX_TOTAL_RECIPIENTS`, SES's 50-recipient limit) on the
  deliverable total; DTO also caps each field (`@ArrayMaxSize`) and body/subject lengths
  (`@MaxLength`).

### Credit metering (Felix)

Charge ~**3× the AWS cost**. The existing billing system already defines **1 credit = $1**:
`DOLLAR_TO_CREDIT_MULTIPLIER = 1_000_000` stores micro-credits, so
`creditsUsedMicro = dollarCost × 1_000_000`. No new credit unit needed.

Cost basis:
- AWS SES outbound = **$0.10 / 1000 emails = $0.0001 per recipient** (SES bills per recipient, each
  To/Cc/Bcc counts).
- 3× markup → **$0.0003 per recipient** → `creditsUsedMicro = 300` per recipient.

Define both pieces as constants so the markup is auditable and AWS repricing is one edit:

```
SES_AWS_COST_PER_RECIPIENT_USD = 0.0001
EMAIL_SEND_CREDIT_MARKUP = 3
```

Meter **per recipient, post-suppression-filter** (charge only what is actually accepted for sending —
matches how SES itself bills). Bcc/Cc count.

Integration (existing path):
1. Add `EMAIL_SEND` to `UsageOperationType`
   (`src/engine/core-modules/usage/enums/usage-operation-type.enum.ts`).
2. Create/map a Stripe meter with eventName `'EMAIL_SEND'` (mirror `WORKFLOW_NODE_RUN`).
3. After a successful driver send, emit:
   ```
   workspaceEventEmitter.emitCustomBatchEvent(USAGE_RECORDED, [{
     resourceType: UsageResourceType.API,
     operationType: UsageOperationType.EMAIL_SEND,
     quantity: acceptedRecipientCount,
     creditsUsedMicro: SES_AWS_COST_PER_RECIPIENT_USD * EMAIL_SEND_CREDIT_MARKUP
       * DOLLAR_TO_CREDIT_MULTIPLIER * acceptedRecipientCount,
     unit: UsageUnit.<email unit>,
     periodStart: subscriptionPeriodStart,
   }], workspaceId)
   ```
4. Pre-send gate: `BillingUsageService.canFeatureBeUsed(workspaceId)` (rejects when the workspace has
   no active subscription); when billing is disabled it returns true so dev/self-host still sends.
   Order in `sendEmail`: verified → tenant-status → from-domain → suppression filter → recipient cap →
   billing gate → throttle → send → meter.

As built: metering emits via the **global `WorkspaceEventEmitter`** only (no `BillingModule` coupling
for the meter itself); the existing `USAGE_RECORDED` → ClickHouse → cap pipeline performs credit
**enforcement** asynchronously (pausing the workspace at the cap), matching how
`WORKFLOW_EXECUTION` is metered. A hard pre-send balance reject (vs the coarse subscription gate) can
layer on later via `BillingUsageService` if product wants it. Adding `EMAIL_SEND` to
`UsageOperationType` also required an entry in the exhaustive
`USAGE_UNIT_BY_OPERATION_TYPE` map (`app-billing.service.ts`).

Attachment data ($0.12/GB on SES) not metered in v1 — note as follow-up. A Stripe meter with
eventName `EMAIL_SEND` must be provisioned for revenue to land (no reverse op-type→meter mapping
exists in code yet).

---

## 4. Enterprise gate

Put the whole feature (provisioning, send, webhook suppression, unsubscribe endpoint) behind the
enterprise flag. Gate at the resolver/service entry points; verified config sets for non-enterprise
workspaces should not provision.

---

## Conventions

- No code comments — self-documenting names.
- Swallow expected SDK errors via `.send(cmd).catch((e) => { if (!(e instanceof X)) throw e; })`, not
  try/catch or helper wrappers.
- `isDefined` from `twenty-shared/utils`; `isNonEmptyString`/`isNonEmptyArray` from `@sniptt/guards`.
- String-literal unions over enums. Named exports. Functional. No `any`.
- After changes: `npx nx typecheck twenty-server`; `oxlint --type-aware` on changed files; jest scoped
  to the file/test, never the full package suite.

## Verified facts (do not re-litigate)

- SES suppression list is account-level only; config-set options only toggle feed/honor of that one list.
- SES tenants isolate reputation + sending-pause, not suppression.
- One contact list per account (max 20 topics) → per-workspace `CreateContactList` is broken.
- Only 3 of 10 SES event types actionable: Permanent Bounce + Complaint (suppress), Subscription
  (unsubscribe). Soft bounce = `DeliveryDelay`.
- `@aws-sdk/client-sesv2@3.1001.0` `Content.Simple` (`Message`) supports `Headers?: MessageHeader[]`.
- Outbound webhook route + `SesOutboundWebhookRouterService` already consume EventBridge→SNS; extend it.
