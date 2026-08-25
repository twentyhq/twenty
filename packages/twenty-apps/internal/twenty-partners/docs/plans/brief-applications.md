# Brief applications — implementation plan

Scope: the `Application` object, which links a Partner to an Opportunity (a brief). This
plan makes a brief public, lets a partner apply with a pitch, and tracks the candidacy to
a winner.

This plan does not cover the partner application intake (a company that asks to become a
partner). That is a different object and a different backlog.

## Baseline

Measured in production before this plan.

| Fact | Value |
|---|---|
| Briefs with `isListed = true` | 0 of 35 |
| Application records | 28 |
| States in use | 17 `INTRODUCED`, 6 `INVITED`, 3 `WON`, 2 `DECLINED` |
| Briefs with exactly 2 applications | 13 of 15 |
| `Application.pitch` filled | 0 of 28 |
| `Application.lastActivityAt` filled | 0 of 28 |
| Validated partners | 29 |
| Validated partners with a workspace account | 22 |
| `Opportunity.introSentAt` stamped | 5 of 35, and missed on 3 of the 8 briefs that reached `INTRODUCED` |
| `Opportunity.stage` in use | `DONE` 20, `NEW` 12, `CUSTOMER` 3. `SCREENING`, `MEETING`, `PROPOSAL`, `DEAD` hold zero records |

## Target flow

1. A client submits the brief form on twenty.com. The Opportunity is created with
   `isListed: true`.
2. A daily digest tells the partners that new briefs are open.
3. A partner applies from the brief. A workflow asks for a pitch and creates the
   Application.
4. You read the pitches, set 2 applications to `INTRODUCED`, and bulk-edit the rest to
   `BACKUP`.
5. You stamp `introSentAt`. The brief unlists and stops taking applications.
6. You set `Opportunity.partner`. The winner goes to `WON`, everything else to `DECLINED`.

## State model

One field, six values. `state` carries both the origin and the step.

| State | Meaning | Writer |
|---|---|---|
| `APPLIED` | applied to a public brief, waiting | `on-application-created` |
| `INVITED` | we pushed a private brief at them, waiting | `twenty-partner-intro` skill |
| `INTRODUCED` | in the running, 2 per brief | you, by hand |
| `BACKUP` | applied or invited, not one of the 2 | you, by bulk edit |
| `WON` | the winner | `on-opportunity-partner-won` |
| `DECLINED` | a loss, and also a partner's own refusal | `on-opportunity-partner-won`, or you |

---

## Phase 1 — Remove `lastActivityAt`

`resolve-candidacy.service.ts` writes this field once, at creation, on the self-apply path.
That duplicates `createdAt`. No other code writes it, and no view filters on it after
Phase 2.

Change all of these together. The manifest fails if a view names a field that no longer
exists.

- `src/modules/application/objects/application.object.ts` — remove the field definition
  and the exported `APPLICATION_LAST_ACTIVITY_AT_FIELD_ID`.
- `src/modules/application/services/resolve-candidacy.service.ts` — stop writing it.
- `src/roles/partner.role.ts` — remove its field permission entry.
- `src/scripts/configure-partner-rls.ts` — remove it from
  `APPLICATION_FIELD_LOCK_EXPECTED`. The script asserts on drift and exits non-zero.
- Remove the column from four views: `my-applications.view.ts`,
  `applications-review.view.ts`, `applications-by-opportunity.view.ts`,
  `application-record-page-fields.view.ts`.
- Update `src/modules/application/__tests__/on-application-created.test.ts`.

## Phase 2 — Delete the follow-up views

You enter by brief or by partner, not by application.

- Delete `src/modules/application/views/followup-applications.view.ts` and
  `src/modules/application/navigation-menu-items/followup-applications.navigation-menu-item.ts`.
- Delete `src/modules/opportunity/views/followup-briefs.view.ts` and
  `src/modules/opportunity/navigation-menu-items/followup-briefs.navigation-menu-item.ts`.
- Remove the orphan UID constants that only those files import.

## Phase 3 — Publish the brief

- `src/modules/opportunity/intake/services/submit-client-brief.service.ts` — set
  `isListed: true` instead of `false`.
- Update `submit-client-brief.test.ts` and `submit-client-brief.integration-test.ts`.

Warning: the client brief form is public on twenty.com. Every submission now reaches all
22 partners with no human between. `notify-client-brief.service.ts` already posts each
submission to Discord, so you see junk as it lands and you unlist it by hand.

## Phase 4 — Automation

### 4a. Unlist on the introduction

New logic function. `on-opportunity-partner-won` cannot carry this: it triggers on
`partnerId`, not on `introSentAt`.

- New `src/modules/opportunity/matching/on-opportunity-intro-sent.logic-function.ts`.
- Trigger `opportunity.updated`, `updatedFields: ['introSentAt']`.
- Set `isListed: false` when `introSentAt` changes from null to a value. Do nothing when
  it is cleared.
- Add the UID to `src/constants/universal-identifiers.ts`.
- Add a unit test in the same shape as `on-opportunity-partner-won.test.ts`.

### 4b. Losers become `DECLINED`

`src/modules/opportunity/matching/services/sync-application-outcomes.service.ts`:

- Assign branch: the winner goes to `WON`, every other application goes to `DECLINED`.
  Today it writes `BACKUP`.
- Unassign branch: reopen `WON` and `DECLINED` to `APPLIED`. Today it reopens `WON` and
  `BACKUP`.
- Update the header comment and `on-opportunity-partner-won.test.ts`.

Known cost: the unassign branch cannot tell an `INTRODUCED` loser from a `BACKUP` one, so
it flattens both to `APPLIED`.

## Phase 5 — Views and layouts

### 5a. A widget view for the record pages

New `TABLE_WIDGET` view on Application. Columns: `opportunity`, `state`, `updatedAt`.
Both record-page widgets bind to it.

### 5b. Partner to brief

`src/modules/partner/directory/page-layouts/partner.page-layout.ts` — add a **Briefs** tab.
One widget:

```ts
configuration: {
  configurationType: 'FIELD',
  fieldMetadataId: <applications on Partner>,
  fieldDisplayMode: 'TABLE',
  viewId: <the 5a view>,
}
```

Use a new tab. The Home tab already carries 30 fields.

### 5c. Brief to partner

`src/modules/opportunity/page-layouts/opportunity.page-layout.ts` — the same widget on the
Home tab, with the `applications` field on Opportunity.

Note: partners see this layout when they open a listed brief. Row-level security limits the
widget to their own row, because `configure-partner-rls.ts` sets `partnerUser IS me` on
`application`. The widget cannot be hidden from them:
`PageLayoutWidgetConditionalDisplay` is typed as bare `object`.

### 5d. The pipeline board

New `KANBAN` view on Application, grouped by `state`, with all six groups, plus a
navigation menu item.

Use a **fresh universal identifier**. Do not change the type of
`applications-review.view.ts`. `src/constants/universal-identifiers.ts:27` records that a
view kept its stale type and groups on re-sync, and that only a new id forced a clean
recreate.

Leave the existing Applications table alone. It stays the surface where you read pitches
and bulk-edit.

### 5e. Fix the Deals board

`src/modules/opportunity/views/deals-board.view.ts` — remove the filter
`PARTNER_ON_OPPORTUNITY_FIELD_ID IS_NOT_EMPTY`. It hides every brief that has no partner,
so the board shows only decided work.

## Phase 6 — Workspace steps, by hand

The SDK has no `defineWorkflow`. These three steps run in the workspace UI after install.
Add them to `src/workflows/README.md`.

### 6a. Rebuild "Apply to Brief"

Manual trigger, single record, object Opportunity.

1. **FORM** step: one `TEXT` input named `pitch`. Label it with the rule: Twenty
   introduces up to 2 partners per brief, so an application is not a guarantee.
2. **FILTER** step: the pitch is not empty. The FORM schema has no required flag, so the
   filter is the only guard.
3. **Create Record** on Application. Map `Opportunity`, `Partner User` and `pitch`.

`Partner User` stays mandatory. The row-level predicate is `partnerUser IS the current
member`, and the server checks the row as submitted.

Correct the stale note in `README.md`. It says to map no field beyond those two.
`configure-partner-rls.ts` lists `pitch` and `opportunity` in
`APPLICATION_FIELD_LOCK_SKIP` as partner-editable, so the pitch mapping is allowed.

A manual-trigger workflow runs under the **clicking user's role**
(`workflow-execution-context.service.ts:40`). So this workflow runs as the partner.

### 6b. Build the daily digest

Cron trigger, once a day.

1. **CRON** trigger, `DAYS` pattern.
2. **FIND RECORDS** on Opportunity: `isListed = true` and created in the last day.
3. Stop when the count is zero.
4. **FIND RECORDS** on Partner: `validationStage = VALIDATED`.
5. **ITERATOR** plus **SEND_EMAIL** from a connected mailbox.

Keep the mail short. Partners already see every open brief in the "Open Briefs" view, so
the mail is a nudge: "3 new briefs are open. Open your partner workspace." No brief
details and no per-partner matching.

A cron workflow runs under the **application role**, so it reads every partner.

### 6c. Run the RLS script

`yarn rls:configure:prod` after install, as usual.

## Phase 7 — Deploy and check

- Bump `package.json` from 1.6.2.
- Deploy with the `twenty-app-deploy` skill. Do not hand-run publish and install for
  production.
- Open the Deals board. If the 20 `DONE` briefs have no column, declare a `DONE` group in
  `deals-board.view.ts`.
- Log in as a partner. Check the "Open Briefs" view, the Apply action, and that the brief
  page shows only that partner's own application.

---

## Deferred

Do not build these now. Each one waits for a number this plan does not yet produce.

| Item | Build it when |
|---|---|
| Shortlist picker front component on the brief | a brief pulls more than about five pitches, and the table becomes hard to read |
| Automatic sweep of the losers to `BACKUP` | the bulk edit becomes a chore. The trigger must be a deliberate act, not a count of introductions |
| The apply action as a front component and an app route | you want the apply path in code, or you want to block a bare Application. It is the only configuration where `canUpdateObjectRecords: false` on Application is possible |
| `OPPORTUNITY_STAGE_OPTIONS` in code, and the dead constant deleted | you fix the drift between production and the repository |

## Accepted risks

- Auto-listing exposes unvetted form submissions to 22 partners. The Discord ping is the
  only guard.
- `introSentAt` is stamped by hand and was missed on 3 of 8 briefs. A missed stamp means
  the brief never unlists.
- Unassigning a winner flattens `INTRODUCED` and `BACKUP` into `APPLIED`.
- A partner's own refusal shares `DECLINED` with a loss, so an unassign can reopen it.
- A partner can create an Application with no pitch. There is no create permission to
  remove: an insert checks `canUpdateObjectRecords`
  (`permissions.utils.ts:164`), and the partner needs that flag to edit the pitch.
- The workspace now needs three hand-built workflows, up from two.
- No brief has ever been public. Every volume number in this plan is untested.
