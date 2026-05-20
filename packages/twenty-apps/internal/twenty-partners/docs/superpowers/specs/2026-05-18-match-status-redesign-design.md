# Match-status redesign — design spec

**Date:** 2026-05-18
**Status:** Draft (awaiting user approval before plan)

## Problem

The matching workflow today is driven by two interacting fields on `Opportunity`:

- `partnerEligible` (BOOLEAN, default `false`) — flipping to `true` triggers the matching logic function.
- `matchStatus` (SELECT, nullable) — tracks post-match progression (`DELIVERED → INTRO_SENT → ... → COMPLETED`).

Two consequences:

1. **The Kanban view (`matches-overview`) groups by `matchStatus`, but most opps have `matchStatus = NULL`.** Those records don't appear in any column, so the Kanban is functionally empty even when the workflow is healthy.
2. **The model has two sources of truth** for "is this opp in the matching pipeline?" — a boolean (`partnerEligible`) and the absence/presence of a status. They drift, and the trigger semantics are encoded across two fields.

## Goal

Collapse the model to a single source of truth: `matchStatus` becomes a non-nullable enum that covers the entire lifecycle from intake through completion. The boolean `partnerEligible` field is removed. The matching trigger moves to a specific status value (`AUTO_MATCH`), so every record is always in a meaningful Kanban column.

## State machine

Ten enum values total.

### Pre-match (3, new)

| Value             | Label          | Color  | Notes                                  |
| ----------------- | -------------- | ------ | -------------------------------------- |
| `TO_BE_MATCHED`   | To Be Matched  | grey   | **Default.** Every new opp starts here. |
| `MANUAL_MATCH`    | Manual Match   | grey   | Ops handles partner assignment manually. |
| `AUTO_MATCH`      | Auto Match     | yellow | Trigger. Logic function runs on entry. Transient (~2s). |

### In-flight (7, existing — `DELIVERED` renamed to `MATCHED`)

| Value          | Label        | Color     |
| -------------- | ------------ | --------- |
| `MATCHED`      | Matched      | blue      |
| `INTRO_SENT`   | Intro Sent   | sky       |
| `ENGAGED`      | Engaged      | turquoise |
| `IMPLEMENTING` | Implementing | green     |
| `COMPLETED`    | Completed    | purple    |
| `STALLED`      | Stalled      | orange    |
| `CANCELLED`    | Cancelled    | red       |

### Transitions

```
                     ┌──────────────► MANUAL_MATCH ───────┐
                     │  (ops choice)                       │  (manual,
TO_BE_MATCHED  ──────┤                                     │   pick a partner)
  (default)          │                                     ▼
                     └──► AUTO_MATCH ─── success ──────► MATCHED ──► INTRO_SENT
                          (trigger)         │              ▲             │
                                            └─ failure ─┐  │             ▼
                                                        │  │          ENGAGED
                                                        ▼  │             │
                                                  MANUAL_MATCH           ▼
                                                  + Note created     IMPLEMENTING
                                                                         │
                                                                         ▼
                                                                     COMPLETED
                                                          (or STALLED / CANCELLED)
```

- `TO_BE_MATCHED → MANUAL_MATCH`: manual.
- `TO_BE_MATCHED → AUTO_MATCH`: manual; triggers logic.
- `AUTO_MATCH → MATCHED`: automatic on logic success. Sets `partnerId`.
- `AUTO_MATCH → MANUAL_MATCH`: automatic on logic failure. Creates a Note on the opp explaining no partner was available.
- `MANUAL_MATCH → MATCHED`: manual (ops assigns a partner + flips status). A follow-up spec adds a modal to assist this; for now it's manual field edits.
- Forward progression `MATCHED → INTRO_SENT → ENGAGED → IMPLEMENTING → COMPLETED` (or off-ramp to `STALLED` / `CANCELLED`): all manual.

## Files affected

### Delete

```
src/fields/opportunity-partner-eligible.field.ts
```

### Rename (UUIDs preserved on all renamed entities)

```
src/logic-functions/on-opportunity-partner-eligible.ts
  → src/logic-functions/on-opportunity-auto-match.ts

src/views/partner-eligible-opportunities.view.ts
  → src/views/all-matched-deals.view.ts

src/navigation-menu-items/partner-deals.navigation-menu-item.ts
  (file name unchanged; label may update to "All matched deals")
```

### Modify

```
src/fields/opportunity-match-status.field.ts        — enum overhaul
src/logic-functions/on-opportunity-auto-match.ts    — trigger + Note + status names
src/views/waiting-for-match.view.ts                 — filter rebase
src/views/matches-overview.view.ts                  — filter rebase
src/views/all-opportunities.view.ts                 — drop partnerEligible column
src/views/all-matched-deals.view.ts                 — filter rebase + rename
src/constants/universal-identifiers.ts              — rename 2 exports
src/scripts/seed-pipeline-demo.ts                   — matchStatus-driven seed
README.md
BACKLOG.md
```

## Detailed changes

### Field: `opportunity-match-status.field.ts`

```ts
isNullable: false,
defaultValue: 'TO_BE_MATCHED',   // verify SDK syntax for SELECT defaults (raw vs. quoted-string)
options: [
  // pre-match (new UUIDs)
  { id: <new-uuid>, value: 'TO_BE_MATCHED', label: 'To Be Matched', position: 0, color: 'grey'   },
  { id: <new-uuid>, value: 'MANUAL_MATCH',  label: 'Manual Match',  position: 1, color: 'grey'   },
  { id: <new-uuid>, value: 'AUTO_MATCH',    label: 'Auto Match',    position: 2, color: 'yellow' },
  // post-match — reuse DELIVERED's UUID for MATCHED so existing rows auto-relabel
  { id: '095428d8-4680-4a2c-af83-7809dcb3f194', value: 'MATCHED', label: 'Matched', position: 3, color: 'blue' },
  // unchanged
  { id: '2f1c79a1-ca91-4937-a4c0-6422f6534d34', value: 'INTRO_SENT',   label: 'Intro Sent',   position: 4, color: 'sky'       },
  { id: '45cdf6ef-8672-40d5-b71f-1e5687ba5776', value: 'ENGAGED',      label: 'Engaged',      position: 5, color: 'turquoise' },
  { id: '7189b18d-b0f7-435a-9272-f812cba5d13d', value: 'IMPLEMENTING', label: 'Implementing', position: 6, color: 'green'     },
  { id: '54cd33bc-11ea-42f1-87c8-cd9d32d2c266', value: 'COMPLETED',    label: 'Completed',    position: 7, color: 'purple'    },
  { id: '505433e8-5367-4dfb-a89a-708d5182165b', value: 'STALLED',      label: 'Stalled',      position: 8, color: 'orange'    },
  { id: '572a9ad2-e0a6-49f2-b1f5-e36c75cc5176', value: 'CANCELLED',    label: 'Cancelled',    position: 9, color: 'red'       },
],
```

### Field: `opportunity-partner-eligible.field.ts` (delete)

No replacement. Universal identifier `eeb2c35d-9ecf-41e3-a36f-55b756687d02` is no longer in use.

### Logic function: `on-opportunity-auto-match.ts`

```ts
const handler = async (payload: DatabaseEventPayload) => {
  const props = payload.properties as {
    after?: { id: string; matchStatus?: string; partnerId?: string | null };
    before?: { matchStatus?: string };
    updatedFields?: string[];
  };

  if (!props.updatedFields?.includes('matchStatus')) return {};
  if (props.after?.matchStatus !== 'AUTO_MATCH') return {};
  if (props.before?.matchStatus === 'AUTO_MATCH') return {};
  if (props.after.partnerId) return {};

  const client = new CoreApiClient();

  const partnersResult = await client.query({
    partners: {
      __args: {
        filter: {
          status: { eq: 'ACTIVE' },
          availability: { eq: 'AVAILABLE' },
        },
        orderBy: [{ lastMatchAt: 'AscNullsFirst' }],
        first: 1,
      },
      edges: { node: { id: true, lastMatchAt: true } },
    },
  } as any);

  const topPartner = (partnersResult.partners as any).edges[0]?.node;

  if (!topPartner) {
    // Failure path: hand off to ops with an audit Note
    const noteBody =
      `Auto-match attempted ${new Date().toISOString()}.\n` +
      `No partners matched (status=ACTIVE, availability=AVAILABLE).\n` +
      `Status moved to Manual Match — pick a partner manually or ` +
      `update partner availability and retry by setting status back to Auto Match.`;

    // Note + NoteTarget creation
    // VERIFY DURING IMPLEMENTATION: exact mutation shape for createNote + createNoteTarget
    // via CoreApiClient. Fallback if SDK path is brittle: append to opportunity.description.

    await client.mutation({
      updateOpportunity: {
        __args: { id: props.after.id, data: { matchStatus: 'MANUAL_MATCH' } },
        id: true,
      },
    } as any);

    return { matched: false, reason: 'no_partner_available' };
  }

  // Success path
  await client.mutation({
    updateOpportunity: {
      __args: {
        id: props.after.id,
        data: { partnerId: topPartner.id, matchStatus: 'MATCHED' },
      },
      id: true,
    },
  } as any);

  await client.mutation({
    updatePartner: {
      __args: { id: topPartner.id, data: { lastMatchAt: new Date().toISOString() } },
      id: true,
    },
  } as any);

  return { matched: true, partnerId: topPartner.id };
};

export default defineLogicFunction({
  universalIdentifier: 'eb8d4d26-8103-4b66-9026-6a86556f7ca5', // preserved
  name: 'on-opportunity-auto-match',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: { eventName: 'opportunity.updated' },
});
```

### Views

| View                     | Filter today                  | Filter new                                                                                                              |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `waiting-for-match`      | `partner IS_EMPTY`            | `matchStatus IS_IN ['TO_BE_MATCHED', 'MANUAL_MATCH']`                                                                   |
| `matches-overview`       | `partnerEligible IS true`     | `matchStatus IS_IN ['AUTO_MATCH', 'MATCHED', 'INTRO_SENT', 'ENGAGED', 'IMPLEMENTING', 'COMPLETED', 'STALLED', 'CANCELLED']` |
| `all-opportunities`      | none                          | none — only column change: drop `partnerEligible` column                                                                |
| `all-matched-deals`†     | `partnerEligible IS true`     | `matchStatus IS_IN ['MATCHED', 'INTRO_SENT', 'ENGAGED', 'IMPLEMENTING', 'COMPLETED', 'STALLED', 'CANCELLED']`           |

† renamed from `partner-eligible-opportunities.view.ts`.

`matches-overview` keeps `mainGroupByFieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER`. Now actually populates because every opp has a non-null `matchStatus`. The `ViewType.KANBAN` SDK limitation (BACKLOG.md) is unchanged — Kanban grouping still flipped manually in the UI.

**Filter operand note:** `IS_IN` (per `ViewFilterOperand.IS_IN`) is preferred. If unsupported for SELECT fields in the SDK version in use, fall back to chained `IS` filters joined with OR semantics, or invert with `NOT_IN`. Verify during implementation.

### Navigation

All four nav items keep their existing constants, positions, and labels. Only `partner-deals.navigation-menu-item.ts` may have its label updated to "All matched deals" to match the renamed view. Recommendation: match the view label.

### Constants (`src/constants/universal-identifiers.ts`)

Rename exports, preserve UUIDs:

```
PARTNER_ELIGIBLE_OPPS_VIEW_UNIVERSAL_IDENTIFIER → ALL_MATCHED_DEALS_VIEW_UNIVERSAL_IDENTIFIER
ON_OPP_PARTNER_ELIGIBLE_FN_UNIVERSAL_IDENTIFIER → ON_OPP_AUTO_MATCH_FN_UNIVERSAL_IDENTIFIER
```

### Seed: `seed-pipeline-demo.ts`

15 opportunities driven by `matchStatus`, distributed across every column for full Kanban demonstration:

| Status            | Count | Partner assigned? |
| ----------------- | ----- | ----------------- |
| `TO_BE_MATCHED`   | 3     | no                |
| `MANUAL_MATCH`    | 2     | no                |
| `AUTO_MATCH`      | 1     | no                |
| `MATCHED`         | 2     | yes               |
| `INTRO_SENT`      | 2     | yes               |
| `ENGAGED`         | 2     | yes               |
| `IMPLEMENTING`    | 1     | yes               |
| `COMPLETED`       | 1     | yes               |
| `STALLED`         | 1     | yes               |

Drop `partnerEligible` from the `OpportunitySeed` type and the `data` payload. `partnerSlug` only present on `MATCHED+` rows. `introSentDaysAgo` only on `INTRO_SENT+`.

### Docs

`README.md`:
- Drop `partnerEligible` from the Opportunity-extensions bullet.
- Replace logic-function bullet: `on-opportunity-auto-match` — fires when `matchStatus` is set to `AUTO_MATCH`; assigns a partner (→ `MATCHED`) or hands off (→ `MANUAL_MATCH` with a Note).
- Reword the "Waiting for match" bullet: opps awaiting human action (`TO_BE_MATCHED` or `MANUAL_MATCH`).

`BACKLOG.md`:
- Remove the `partnerEligible` entry under field descriptions.
- Add: **"Manual-match modal — Front Component widget on the opportunity record page that lets ops pick a partner from the available list and triggers the same post-match side-effects as the auto path (Note, `lastMatchAt` bump, future email send)."**

## Data migration

Local dev only — no production data. Cleanest path is to drop the existing workspace and re-run the seed pipeline:

```
# 1. Drop/recreate the workspace (mechanism to confirm during implementation —
#    via the Twenty UI's workspace reset, the local dev API, or a fresh DB).
# 2. yarn twenty manifest:sync
# 3. yarn vitest run --config vitest.seed.config.ts
```

Inline alternative (not recommended for a dev app): one-off migration logic function to backfill `matchStatus = TO_BE_MATCHED` where null, and rewrite `DELIVERED → MATCHED` if the value-rename approach doesn't auto-relabel.

## Verification gates

1. `yarn twenty lint` clean.
2. `yarn twenty manifest:sync` succeeds.
3. After reset + reseed: 15 opps populate 9 of the 10 status values (`CANCELLED` intentionally empty unless added to seed).
4. UI smoke test: flip an opp from `TO_BE_MATCHED → AUTO_MATCH`. Confirm it lands on `MATCHED` with a partner assigned within ~2s.
5. UI smoke test: set partner availability to none, flip another opp `TO_BE_MATCHED → AUTO_MATCH`. Confirm it lands on `MANUAL_MATCH` with a Note attached.
6. Open Matches Overview, switch to Kanban grouping in the UI. Confirm every populated column renders, no opps missing.

## Out of scope (BACKLOG.md follow-ups)

- Manual-match modal (Front Component + companion logic function for partner selection).
- Email send when partner is assigned (both auto and manual paths).
- Shared post-match side-effect framework so auto and manual converge on identical downstream behavior.

## Open verification items for implementation

- Exact GraphQL mutation shape for `createNote` + `createNoteTarget` via `CoreApiClient`. Fallback: append to `opportunity.description`.
- Whether `ViewFilterOperand.IS_IN` works on SELECT fields in the current SDK; fallback to inverted `NOT_IN` or chained `IS` filters.
- Whether renaming an enum option's `value` (`DELIVERED` → `MATCHED`) while keeping its UUID auto-relabels existing records, or requires a data migration. If it doesn't, add a backfill step.
- Exact syntax for a SELECT field's `defaultValue` in `defineField` (raw string vs. quoted-string). No existing SELECT in this codebase uses a default — confirm by pattern in `twenty-sdk` or in the Twenty examples repo.
- Mechanism for resetting the local dev workspace before reseeding.
