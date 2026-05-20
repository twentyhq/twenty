# Match-status redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse `partnerEligible` (boolean) and `matchStatus` (nullable enum) into a single non-nullable `matchStatus` enum that covers the full opportunity lifecycle, with the matching trigger moved to a specific status value (`AUTO_MATCH`).

**Architecture:** Twenty SDK declarative app — fields, views, navigation, and logic functions are TypeScript modules synced to a local Twenty server. Tests are vitest integration tests that hit the running server via `CoreApiClient`. The schema gets pushed via `appDevOnce()` automatically when integration tests run (`src/__tests__/global-setup.ts`).

**Tech Stack:** TypeScript, twenty-sdk 2.4.0, twenty-client-sdk 2.4.0, vitest 3.1.1, oxlint.

**Spec:** [docs/superpowers/specs/2026-05-18-match-status-redesign-design.md](../specs/2026-05-18-match-status-redesign-design.md)

---

## Pre-flight

- [ ] **Step 0.1: Confirm Twenty server is running**

Run: `yarn twenty server status`
Expected: server is running (start with `yarn twenty server start` if not).

- [ ] **Step 0.2: Capture baseline (lint passes)**

Run: `yarn lint`
Expected: no errors (warnings OK).

- [ ] **Step 0.3: Capture baseline (existing integration tests pass)**

Run: `yarn test`
Expected: `schema.integration-test.ts` passes. If it fails, fix the local environment before proceeding — every later task depends on it.

---

## Task 1: Update matchStatus field enum

**Files:**
- Modify: `src/fields/opportunity-match-status.field.ts`

- [ ] **Step 1.1: Replace the field definition**

Replace the entire file contents with:

```ts
import { MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'matchStatus',
  label: 'Match Status',
  isNullable: false,
  defaultValue: "'TO_BE_MATCHED'",
  options: [
    // Pre-match (new). NEW UUIDs generated with `uuidgen` (v4).
    { id: '8b3a1c0e-2f64-4a87-9d2b-1e3c4f5a6b78', value: 'TO_BE_MATCHED', label: 'To Be Matched', position: 0, color: 'grey' },
    { id: '4c5d6e7f-8a9b-4c0d-9e1f-2a3b4c5d6e7f', value: 'MANUAL_MATCH',  label: 'Manual Match',  position: 1, color: 'grey' },
    { id: '7e8f9a0b-1c2d-4e3f-8a4b-5c6d7e8f9a0b', value: 'AUTO_MATCH',    label: 'Auto Match',    position: 2, color: 'yellow' },
    // Post-match. Reuse DELIVERED's UUID for MATCHED so existing rows auto-relabel.
    { id: '095428d8-4680-4a2c-af83-7809dcb3f194', value: 'MATCHED',       label: 'Matched',       position: 3, color: 'blue' },
    { id: '2f1c79a1-ca91-4937-a4c0-6422f6534d34', value: 'INTRO_SENT',    label: 'Intro Sent',    position: 4, color: 'sky' },
    { id: '45cdf6ef-8672-40d5-b71f-1e5687ba5776', value: 'ENGAGED',       label: 'Engaged',       position: 5, color: 'turquoise' },
    { id: '7189b18d-b0f7-435a-9272-f812cba5d13d', value: 'IMPLEMENTING',  label: 'Implementing',  position: 6, color: 'green' },
    { id: '54cd33bc-11ea-42f1-87c8-cd9d32d2c266', value: 'COMPLETED',     label: 'Completed',     position: 7, color: 'purple' },
    { id: '505433e8-5367-4dfb-a89a-708d5182165b', value: 'STALLED',       label: 'Stalled',       position: 8, color: 'orange' },
    { id: '572a9ad2-e0a6-49f2-b1f5-e36c75cc5176', value: 'CANCELLED',     label: 'Cancelled',     position: 9, color: 'red' },
  ],
});
```

**Verification note for defaultValue:** The SDK may accept either `defaultValue: 'TO_BE_MATCHED'` (raw) or `defaultValue: "'TO_BE_MATCHED'"` (quoted-string SQL-default style). If the lint or sync step below errors on the quoted form, switch to the raw form and retry.

- [ ] **Step 1.2: Lint**

Run: `yarn lint`
Expected: no new errors. (Pre-existing warnings unrelated to this file are OK.)

- [ ] **Step 1.3: Commit**

```bash
git add src/fields/opportunity-match-status.field.ts
git commit -m "feat(field): redesign matchStatus enum with pre-match states"
```

---

## Task 2: Delete partnerEligible field

**Files:**
- Delete: `src/fields/opportunity-partner-eligible.field.ts`

- [ ] **Step 2.1: Delete the file**

```bash
rm src/fields/opportunity-partner-eligible.field.ts
```

- [ ] **Step 2.2: Confirm no source imports reference it**

Run: `grep -rn "opportunity-partner-eligible" src/`
Expected: no matches (the file's UUID was hardcoded inline in views/seed; those will be cleaned up in later tasks).

- [ ] **Step 2.3: Lint**

Run: `yarn lint`
Expected: no errors.

- [ ] **Step 2.4: Commit**

```bash
git add -A src/fields/
git commit -m "feat(field): remove partnerEligible boolean (collapsed into matchStatus)"
```

---

## Task 3: Rename constants

**Files:**
- Modify: `src/constants/universal-identifiers.ts`

- [ ] **Step 3.1: Rename two exports (UUIDs preserved)**

In `src/constants/universal-identifiers.ts`:

Change:
```ts
export const PARTNER_ELIGIBLE_OPPS_VIEW_UNIVERSAL_IDENTIFIER = '7a34da39-a8e1-44c7-88b4-91ceaa064920';
```
to:
```ts
export const ALL_MATCHED_DEALS_VIEW_UNIVERSAL_IDENTIFIER = '7a34da39-a8e1-44c7-88b4-91ceaa064920';
```

Change:
```ts
export const ON_OPP_PARTNER_ELIGIBLE_FN_UNIVERSAL_IDENTIFIER = 'eb8d4d26-8103-4b66-9026-6a86556f7ca5';
```
to:
```ts
export const ON_OPP_AUTO_MATCH_FN_UNIVERSAL_IDENTIFIER = 'eb8d4d26-8103-4b66-9026-6a86556f7ca5';
```

- [ ] **Step 3.2: Update all importers (defer the actual file edits)**

Run: `grep -rln "PARTNER_ELIGIBLE_OPPS_VIEW_UNIVERSAL_IDENTIFIER\|ON_OPP_PARTNER_ELIGIBLE_FN_UNIVERSAL_IDENTIFIER" src/`
Expected output (these will be fixed in later tasks):
```
src/navigation-menu-items/partner-deals.navigation-menu-item.ts
src/views/partner-eligible-opportunities.view.ts
```

These two files will be fixed in Tasks 9 and 8 respectively. Don't fix them in this task — the lint failures from broken imports are expected here.

- [ ] **Step 3.3: Commit the constants rename only**

```bash
git add src/constants/universal-identifiers.ts
git commit -m "refactor(constants): rename partner-eligible identifiers to match-status terms"
```

Note: do NOT run `yarn lint` between Tasks 3 and 8 — broken imports are expected and tracked.

---

## Task 4: Write failing integration test for AUTO_MATCH happy path

**Files:**
- Create: `src/logic-functions/__tests__/on-opportunity-auto-match.integration-test.ts`

- [ ] **Step 4.1: Create the test file**

```ts
import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Helpers
async function createOpp(client: CoreApiClient, name: string) {
  const r = await client.mutation({
    createOpportunity: {
      __args: { data: { name } },
      id: true,
      matchStatus: true,
    },
  } as any);
  return (r as any).createOpportunity as { id: string; matchStatus: string };
}

async function destroyOpp(client: CoreApiClient, id: string) {
  await client
    .mutation({ destroyOpportunity: { __args: { id }, id: true } } as any)
    .catch(() => {});
}

async function getOpp(client: CoreApiClient, id: string) {
  const r = await client.query({
    opportunity: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      matchStatus: true,
      partner: { id: true },
    },
  } as any);
  return (r as any).opportunity as {
    id: string;
    matchStatus: string;
    partner: { id: string } | null;
  };
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

describe('on-opportunity-auto-match (success path)', () => {
  let client: CoreApiClient;
  const created: string[] = [];

  beforeEach(() => {
    client = new CoreApiClient();
  });

  afterEach(async () => {
    for (const id of created) await destroyOpp(client, id);
    created.length = 0;
  });

  it('defaults a new opportunity to TO_BE_MATCHED', async () => {
    const opp = await createOpp(client, `[test] default status ${Date.now()}`);
    created.push(opp.id);
    expect(opp.matchStatus).toBe('TO_BE_MATCHED');
  });

  it('assigns a partner and flips to MATCHED when set to AUTO_MATCH', async () => {
    const opp = await createOpp(client, `[test] auto match ${Date.now()}`);
    created.push(opp.id);

    await client.mutation({
      updateOpportunity: {
        __args: { id: opp.id, data: { matchStatus: 'AUTO_MATCH' } },
        id: true,
      },
    } as any);

    // Logic function runs async (~2s per spec). Poll up to 10s.
    let final = await getOpp(client, opp.id);
    for (let i = 0; i < 20 && final.matchStatus === 'AUTO_MATCH'; i++) {
      await sleep(500);
      final = await getOpp(client, opp.id);
    }

    expect(final.matchStatus).toBe('MATCHED');
    expect(final.partner?.id).toBeDefined();
  });
});
```

- [ ] **Step 4.2: Run the test and verify it fails**

Run: `yarn test src/logic-functions/__tests__/on-opportunity-auto-match.integration-test.ts`
Expected: FAIL on either:
- "defaults to TO_BE_MATCHED" — server has the new field but the default isn't applying yet (OK), **OR**
- "assigns a partner" — the old logic function is still wired to `partnerEligible`, won't trigger on matchStatus change.

If the first test passes (default works) but the second fails, that's the expected state — the field change is live but the function isn't rewritten yet.

- [ ] **Step 4.3: Commit the failing test**

```bash
git add src/logic-functions/__tests__/on-opportunity-auto-match.integration-test.ts
git commit -m "test(auto-match): add success-path integration test (failing)"
```

---

## Task 5: Rename and rewrite logic function (happy path only)

**Files:**
- Delete: `src/logic-functions/on-opportunity-partner-eligible.ts`
- Create: `src/logic-functions/on-opportunity-auto-match.ts`

- [ ] **Step 5.1: Delete the old logic function**

```bash
rm src/logic-functions/on-opportunity-partner-eligible.ts
```

- [ ] **Step 5.2: Create the new logic function (success path; failure path added in Task 7)**

Create `src/logic-functions/on-opportunity-auto-match.ts`:

```ts
import { DatabaseEventPayload, defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { ON_OPP_AUTO_MATCH_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Fires when an opportunity's matchStatus is set to 'AUTO_MATCH'.
// Picks the longest-idle available partner, assigns it, and flips status to 'MATCHED'.
// Failure path (no partner available) is added in a follow-up task.
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
    console.log('No eligible partner for opportunity', props.after.id);
    return { matched: false };
  }

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
      __args: {
        id: topPartner.id,
        data: { lastMatchAt: new Date().toISOString() },
      },
      id: true,
    },
  } as any);

  return { matched: true, partnerId: topPartner.id };
};

export default defineLogicFunction({
  universalIdentifier: ON_OPP_AUTO_MATCH_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-auto-match',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
  },
});
```

- [ ] **Step 5.3: Run the happy-path test**

Run: `yarn test src/logic-functions/__tests__/on-opportunity-auto-match.integration-test.ts`
Expected: both tests PASS.

If "assigns a partner" still fails, check:
- Server saw the schema change (test harness auto-syncs via `appDevOnce`).
- There's at least one Partner with `status=ACTIVE` and `availability=AVAILABLE` in the workspace (seed-marketplace-partners may need to have been run).

- [ ] **Step 5.4: Commit**

```bash
git add src/logic-functions/
git commit -m "feat(logic): rewrite matching trigger to fire on matchStatus=AUTO_MATCH"
```

---

## Task 6: Write failing test for AUTO_MATCH failure path

**Files:**
- Modify: `src/logic-functions/__tests__/on-opportunity-auto-match.integration-test.ts`

- [ ] **Step 6.1: Add a failure-path test**

Append to the test file (inside the same file, new `describe` block):

```ts
describe('on-opportunity-auto-match (failure path)', () => {
  let client: CoreApiClient;
  const createdOpps: string[] = [];
  const flippedPartners: Array<{ id: string; prevAvailability: string }> = [];

  beforeEach(() => {
    client = new CoreApiClient();
  });

  afterEach(async () => {
    // Restore partner availabilities first so other tests find a partner.
    for (const p of flippedPartners) {
      await client
        .mutation({
          updatePartner: {
            __args: { id: p.id, data: { availability: p.prevAvailability } },
            id: true,
          },
        } as any)
        .catch(() => {});
    }
    flippedPartners.length = 0;

    for (const id of createdOpps) await destroyOpp(client, id);
    createdOpps.length = 0;
  });

  it('hands off to MANUAL_MATCH with a Note when no partner is available', async () => {
    // Make every AVAILABLE partner UNAVAILABLE for the duration of this test.
    const all = await client.query({
      partners: {
        __args: {
          filter: { availability: { eq: 'AVAILABLE' } },
          first: 100,
        },
        edges: { node: { id: true, availability: true } },
      },
    } as any);

    const edges = ((all as any)?.partners?.edges ?? []) as Array<{
      node: { id: string; availability: string };
    }>;

    for (const e of edges) {
      flippedPartners.push({ id: e.node.id, prevAvailability: e.node.availability });
      await client.mutation({
        updatePartner: {
          __args: { id: e.node.id, data: { availability: 'UNAVAILABLE' } },
          id: true,
        },
      } as any);
    }

    const opp = await createOpp(client, `[test] no-partner ${Date.now()}`);
    createdOpps.push(opp.id);

    await client.mutation({
      updateOpportunity: {
        __args: { id: opp.id, data: { matchStatus: 'AUTO_MATCH' } },
        id: true,
      },
    } as any);

    let final = await getOpp(client, opp.id);
    for (let i = 0; i < 20 && final.matchStatus === 'AUTO_MATCH'; i++) {
      await sleep(500);
      final = await getOpp(client, opp.id);
    }

    expect(final.matchStatus).toBe('MANUAL_MATCH');
    expect(final.partner).toBeNull();

    // Confirm a Note was attached.
    const notes = await client.query({
      noteTargets: {
        __args: {
          filter: { opportunityId: { eq: opp.id } },
          first: 10,
        },
        edges: {
          node: {
            id: true,
            note: { id: true, title: true, body: true },
          },
        },
      },
    } as any);
    const noteEdges = ((notes as any)?.noteTargets?.edges ?? []) as Array<{
      node: { note: { title: string; body: string } };
    }>;

    const autoMatchNote = noteEdges.find((e) =>
      e.node.note.title.toLowerCase().includes('auto-match'),
    );
    expect(autoMatchNote).toBeDefined();
    expect(autoMatchNote!.node.note.body).toContain('No partners');
  });
});
```

- [ ] **Step 6.2: Run the new test and verify it fails**

Run: `yarn test src/logic-functions/__tests__/on-opportunity-auto-match.integration-test.ts`
Expected: the failure-path test FAILS (status stays at `AUTO_MATCH`, no Note created). The happy-path tests still pass.

- [ ] **Step 6.3: Commit the failing test**

```bash
git add src/logic-functions/__tests__/on-opportunity-auto-match.integration-test.ts
git commit -m "test(auto-match): add failure-path integration test (failing)"
```

---

## Task 7: Implement failure path with Note creation

**Files:**
- Modify: `src/logic-functions/on-opportunity-auto-match.ts`

- [ ] **Step 7.1: Replace the no-partner branch with the failure-path implementation**

In `src/logic-functions/on-opportunity-auto-match.ts`, find:

```ts
  const topPartner = (partnersResult.partners as any).edges[0]?.node;
  if (!topPartner) {
    console.log('No eligible partner for opportunity', props.after.id);
    return { matched: false };
  }
```

Replace with:

```ts
  const topPartner = (partnersResult.partners as any).edges[0]?.node;
  if (!topPartner) {
    const noteBody =
      `Auto-match attempted ${new Date().toISOString()}.\n` +
      `No partners matched (status=ACTIVE, availability=AVAILABLE).\n` +
      `Status moved to Manual Match — pick a partner manually or ` +
      `update partner availability and retry by setting status back to Auto Match.`;

    const noteResult = await client.mutation({
      createNote: {
        __args: { data: { title: 'Auto-match failed', body: noteBody } },
        id: true,
      },
    } as any);
    const noteId = (noteResult as any).createNote.id as string;

    await client.mutation({
      createNoteTarget: {
        __args: { data: { noteId, opportunityId: props.after.id } },
        id: true,
      },
    } as any);

    await client.mutation({
      updateOpportunity: {
        __args: { id: props.after.id, data: { matchStatus: 'MANUAL_MATCH' } },
        id: true,
      },
    } as any);

    return { matched: false, reason: 'no_partner_available' };
  }
```

**Fallback if `createNoteTarget` errors with "unknown field":** The mutation name in some Twenty versions is `createNoteTarget` with `data: { noteId, opportunityId }`, but the field name on `NoteTarget` could be `opportunityId` only when `targetTypeName='opportunity'` is set. If the mutation errors, query the workspace schema with:
```ts
client.query({ __schema: { types: { name: true, inputFields: { name: true, type: { name: true } } } } } as any)
```
…and adjust the `data:` payload to whatever shape the introspection returns for `CreateNoteTargetInput`. As a last-resort fallback, append the note body to `opportunity.description` instead and skip the Note object entirely.

- [ ] **Step 7.2: Run the failure-path test**

Run: `yarn test src/logic-functions/__tests__/on-opportunity-auto-match.integration-test.ts`
Expected: ALL tests PASS (both happy-path tests and the failure-path test).

- [ ] **Step 7.3: Commit**

```bash
git add src/logic-functions/on-opportunity-auto-match.ts
git commit -m "feat(logic): on auto-match failure, hand off to MANUAL_MATCH with audit Note"
```

---

## Task 8: Update views — drop partnerEligible references

**Files:**
- Modify: `src/views/waiting-for-match.view.ts`
- Modify: `src/views/matches-overview.view.ts`
- Modify: `src/views/all-opportunities.view.ts`
- Modify: `src/views/partner-eligible-opportunities.view.ts` (renamed in Task 9)

### Step 8.1 — waiting-for-match

- [ ] **Step 8.1.a: Rewrite waiting-for-match.view.ts**

Replace the file with:

```ts
import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Ops inbox: opportunities awaiting a human matching decision.
// Includes TO_BE_MATCHED (default for new opps) and MANUAL_MATCH
// (opps that auto-match couldn't resolve or that ops opted to handle manually).
export default defineView({
  universalIdentifier: WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Waiting for match',
  icon: 'IconClockHour4',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  fields: [
    { universalIdentifier: 'd74b5eb3-21ee-48fa-b703-4cfd629738b4', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true },
    { universalIdentifier: '50822cf9-c238-4450-ba31-5807011afa65', fieldMetadataUniversalIdentifier: '20202020-cbac-457e-b565-adece5fc815f', position: 1, isVisible: true },
    { universalIdentifier: 'f432a71f-3bd0-495e-b5b1-8a78e155dc5a', fieldMetadataUniversalIdentifier: '20202020-d01b-4132-9b32-123456789abc', position: 2, isVisible: true },
    { universalIdentifier: '9e47592f-9965-4ee7-9c6a-303477b293f4', fieldMetadataUniversalIdentifier: 'cc6b8a59-f860-493f-8b9a-f138c078fbf1', position: 3, isVisible: true },
    // matchStatus column (replaces the dropped partnerEligible column)
    { universalIdentifier: '909e1eee-077a-4f23-8c9b-4c8027623a78', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true },
  ],
  filters: [
    {
      universalIdentifier: '93476207-1471-49d9-898c-f8a1d52f468f',
      fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: 'TO_BE_MATCHED,MANUAL_MATCH',
    },
  ],
  sorts: [
    {
      universalIdentifier: 'a7c5a89e-d9d7-4cf6-a6d2-3ad9f12a7b1f',
      fieldMetadataUniversalIdentifier: '20202020-d01b-4132-9b32-123456789abc',
      direction: ViewSortDirection.ASC,
    },
  ],
});
```

**Filter syntax note (applies to all `IS_IN`-style filters in this task):** Twenty's SDK in this version expresses multi-value SELECT filters by setting `operand: ViewFilterOperand.IS` and passing `value` as a comma-separated string of enum values. If this doesn't render correctly in the UI after sync (e.g., filter shows as a single literal string match), the alternative is one of:
1. Two filters at the same nesting level with `operand: ViewFilterOperand.IS` and a single value each (the UI usually ORs same-field filters).
2. `operand: ViewFilterOperand.IS_NOT` with the comma-separated list of statuses to exclude (the complement of the desired set).

Pick whichever the manifest sync accepts; document the choice with a one-line comment in the view file.

### Step 8.2 — matches-overview

- [ ] **Step 8.2.a: Rewrite matches-overview.view.ts**

Replace the file with:

```ts
import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Funnel of in-pipeline opportunities. Grouped by matchStatus to feed a Kanban
// (group-by works; ViewType.KANBAN itself is still TABLE due to BACKLOG.md
// SDK limitation — flip to Kanban manually in the UI).
// Excludes TO_BE_MATCHED and MANUAL_MATCH (those live in the Waiting for match inbox).
export default defineView({
  universalIdentifier: MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Matches overview',
  icon: 'IconLayoutKanban',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  mainGroupByFieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    { universalIdentifier: '7a6403c1-7ab9-4c3a-b833-3c028d43140e', fieldMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.name.universalIdentifier, position: 0, isVisible: true },
    { universalIdentifier: '2e718b4b-fde8-4839-9cdf-deb09db0e6b6', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 1, isVisible: true },
    { universalIdentifier: '5ae8805c-3d71-4ccc-a2be-38368f32e3e1', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true },
    { universalIdentifier: 'cb4e5d2b-7003-4f30-874c-acda310b250c', fieldMetadataUniversalIdentifier: 'fcf39b0c-0547-415e-806d-b238131ad7cc', position: 3, isVisible: true },
    { universalIdentifier: '0fc87e70-7aa1-4c85-9152-d0edff8ae8a4', fieldMetadataUniversalIdentifier: 'cc6b8a59-f860-493f-8b9a-f138c078fbf1', position: 4, isVisible: true },
  ],
  filters: [
    {
      universalIdentifier: 'c2556a69-5ee7-4e1c-a5e5-ed277ae7e3e0',
      fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      // Include AUTO_MATCH + all post-match statuses. See filter-syntax note in Task 8.1.
      operand: ViewFilterOperand.IS,
      value: 'AUTO_MATCH,MATCHED,INTRO_SENT,ENGAGED,IMPLEMENTING,COMPLETED,STALLED,CANCELLED',
    },
  ],
});
```

Note: the matchStatus column UUID `d8dd0623-3a4c-4ab3-a1e0-4ece7df24fb2` is the same value as `MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER` — just imported via the constant for clarity. The partner relation column (`d9eeacaa-...`) is preserved at position 1. Total columns: 5, positions 0–4.

### Step 8.3 — all-opportunities

- [ ] **Step 8.3.a: Rewrite all-opportunities.view.ts to drop the partnerEligible column**

Replace the file with:

```ts
import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Default Opportunities view replacement. Surfaces matchStatus + partner alongside
// the standard Opportunity columns. partnerEligible column was dropped as part of
// the match-status redesign.
export default defineView({
  universalIdentifier: ALL_OPPORTUNITIES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Opportunities',
  icon: 'IconTargetArrow',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  fields: [
    { universalIdentifier: '62844317-546c-4b65-a292-917bf0b5bfce', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true },
    { universalIdentifier: '295a5b86-0b37-475a-8645-26f7e7a3dd0a', fieldMetadataUniversalIdentifier: '20202020-cbac-457e-b565-adece5fc815f', position: 1, isVisible: true },
    { universalIdentifier: 'ce684df4-4456-427c-b33b-38a34368e380', fieldMetadataUniversalIdentifier: '20202020-6f76-477d-8551-28cd65b2b4b9', position: 2, isVisible: true },
    { universalIdentifier: '9f72d1ce-7c39-418c-95cb-480d1b176821', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 3, isVisible: true },
    { universalIdentifier: '5db9ee26-8688-4a5c-9fe8-f76b41d8e80b', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 4, isVisible: true },
    { universalIdentifier: '3727d213-e3f5-43c7-ab05-b0fb2f211273', fieldMetadataUniversalIdentifier: '20202020-527e-44d6-b1ac-c4158d307b97', position: 5, isVisible: true },
    { universalIdentifier: 'c9ad9056-fd3a-448c-b4dc-e95e0c5d22e9', fieldMetadataUniversalIdentifier: '20202020-a63e-4a62-8e63-42a51828f831', position: 6, isVisible: true },
  ],
});
```

- [ ] **Step 8.4: Commit the three view rewrites**

```bash
git add src/views/waiting-for-match.view.ts src/views/matches-overview.view.ts src/views/all-opportunities.view.ts
git commit -m "refactor(views): rebase filters and columns onto matchStatus enum"
```

---

## Task 9: Rename "partner-eligible-opportunities" view → "all-matched-deals"

**Files:**
- Delete: `src/views/partner-eligible-opportunities.view.ts`
- Create: `src/views/all-matched-deals.view.ts`

- [ ] **Step 9.1: Delete the old file**

```bash
rm src/views/partner-eligible-opportunities.view.ts
```

- [ ] **Step 9.2: Create the renamed file**

Create `src/views/all-matched-deals.view.ts`:

```ts
import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import {
  ALL_MATCHED_DEALS_VIEW_UNIVERSAL_IDENTIFIER,
  MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Opportunities where a partner is engaged (MATCHED or later). Distinct from
// Matches overview, which also includes AUTO_MATCH (in-flight, no partner yet).
export default defineView({
  universalIdentifier: ALL_MATCHED_DEALS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'All matched deals',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  fields: [
    { universalIdentifier: '76f6aea5-0e0b-4787-84f0-430d0799e913', fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5', position: 0, isVisible: true },
    { universalIdentifier: 'd9862d49-eff8-4103-9f48-a193cf8e1de2', fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true },
    { universalIdentifier: '91c42a01-4ec8-4527-b9ac-9bdeb58e7243', fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49', position: 2, isVisible: true },
    { universalIdentifier: 'c9689260-86f5-4e19-a86c-7afc95d4d6fe', fieldMetadataUniversalIdentifier: 'cc6b8a59-f860-493f-8b9a-f138c078fbf1', position: 3, isVisible: true },
    { universalIdentifier: 'd51c2737-26f8-4f27-b078-7bb0cf58c662', fieldMetadataUniversalIdentifier: 'fcf39b0c-0547-415e-806d-b238131ad7cc', position: 4, isVisible: true },
  ],
  filters: [
    {
      universalIdentifier: '71de9b3a-e59b-4baf-99e6-84fe01e037ee',
      fieldMetadataUniversalIdentifier: MATCH_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      // See filter-syntax note in Task 8.1.
      operand: ViewFilterOperand.IS,
      value: 'MATCHED,INTRO_SENT,ENGAGED,IMPLEMENTING,COMPLETED,STALLED,CANCELLED',
    },
  ],
});
```

- [ ] **Step 9.3: Lint**

Run: `yarn lint`
Expected: no errors (one consumer — partner-deals nav — fixed in next task).

- [ ] **Step 9.4: Commit**

```bash
git add src/views/
git commit -m "refactor(views): rename partner-eligible-opportunities to all-matched-deals"
```

---

## Task 10: Update partner-deals navigation menu item

**Files:**
- Modify: `src/navigation-menu-items/partner-deals.navigation-menu-item.ts`

- [ ] **Step 10.1: Update label and constant import**

Open the file and:
- Replace the import `PARTNER_ELIGIBLE_OPPS_VIEW_UNIVERSAL_IDENTIFIER` with `ALL_MATCHED_DEALS_VIEW_UNIVERSAL_IDENTIFIER`.
- Update the `viewUniversalIdentifier:` reference accordingly.
- Change the `label:` (or `name:`) from `'All partner deals'` to `'All matched deals'`.
- Keep `universalIdentifier` and `position` unchanged.

Read the file first to confirm the exact field shape, then apply the substitutions.

- [ ] **Step 10.2: Lint**

Run: `yarn lint`
Expected: no errors (all imports of the old constant should now be gone).

Verify with:
```bash
grep -rn "PARTNER_ELIGIBLE_OPPS_VIEW_UNIVERSAL_IDENTIFIER\|ON_OPP_PARTNER_ELIGIBLE_FN_UNIVERSAL_IDENTIFIER" src/
```
Expected: no output.

- [ ] **Step 10.3: Commit**

```bash
git add src/navigation-menu-items/partner-deals.navigation-menu-item.ts
git commit -m "refactor(nav): point partner-deals item at All matched deals view"
```

---

## Task 11: Update seed script

**Files:**
- Modify: `src/scripts/seed-pipeline-demo.ts`

- [ ] **Step 11.1: Rewrite the OpportunitySeed type and OPPORTUNITIES array**

Replace these sections in `src/scripts/seed-pipeline-demo.ts`:

Replace the `OpportunitySeed` type:
```ts
type OpportunitySeed = {
  name: string;
  companyName: string;
  personFirstName: string;
  matchStatus:
    | 'TO_BE_MATCHED'
    | 'MANUAL_MATCH'
    | 'AUTO_MATCH'
    | 'MATCHED'
    | 'INTRO_SENT'
    | 'ENGAGED'
    | 'IMPLEMENTING'
    | 'COMPLETED'
    | 'STALLED';
  partnerSlug?: string;
  introSentDaysAgo?: number;
};
```

Replace the `OPPORTUNITIES` array with 15 entries that populate 9 of the 10 statuses (CANCELLED intentionally empty):

```ts
const OPPORTUNITIES: OpportunitySeed[] = [
  // 3 × TO_BE_MATCHED (default state, no track decided yet)
  { name: 'Acme RE — Q3 renewal',         companyName: 'Acme Real Estate',     personFirstName: 'Camille', matchStatus: 'TO_BE_MATCHED' },
  { name: 'Helix Bio — investor reporting', companyName: 'Helix Bio',          personFirstName: 'Maya',    matchStatus: 'TO_BE_MATCHED' },
  { name: 'Sunrise — driver app sync',    companyName: 'Sunrise Logistics',    personFirstName: 'Wei',     matchStatus: 'TO_BE_MATCHED' },

  // 2 × MANUAL_MATCH (ops will handle manually)
  { name: 'Acme RE — agent training',     companyName: 'Acme Real Estate',     personFirstName: 'Camille', matchStatus: 'MANUAL_MATCH' },
  { name: 'Sunrise — vendor onboarding',  companyName: 'Sunrise Logistics',    personFirstName: 'Wei',     matchStatus: 'MANUAL_MATCH' },

  // 1 × AUTO_MATCH (in-flight, no partner yet — usually transient)
  { name: 'Helix Bio — pipeline review',  companyName: 'Helix Bio',            personFirstName: 'Maya',    matchStatus: 'AUTO_MATCH' },

  // 2 × MATCHED (partner just assigned)
  { name: 'Acme RE — CRM rollout',        companyName: 'Acme Real Estate',     personFirstName: 'Camille', matchStatus: 'MATCHED',      partnerSlug: 'elevate-consulting' },
  { name: 'Helix Bio — Sales ops migration', companyName: 'Helix Bio',         personFirstName: 'Maya',    matchStatus: 'MATCHED',      partnerSlug: 'meridian-craft' },

  // 2 × INTRO_SENT (3 + 5 days ago)
  { name: 'Sunrise — APAC fleet CRM',     companyName: 'Sunrise Logistics',    personFirstName: 'Wei',     matchStatus: 'INTRO_SENT',   partnerSlug: 'nine-dots-ventures',   introSentDaysAgo: 3 },
  { name: 'Acme RE — WhatsApp integration', companyName: 'Acme Real Estate',   personFirstName: 'Camille', matchStatus: 'INTRO_SENT',   partnerSlug: 'w3villa-technologies', introSentDaysAgo: 5 },

  // 2 × ENGAGED
  { name: 'Helix Bio — clinical trials CRM', companyName: 'Helix Bio',         personFirstName: 'Maya',    matchStatus: 'ENGAGED',      partnerSlug: 'netzero-systems',      introSentDaysAgo: 10 },
  { name: 'Sunrise — warehouse rollout',  companyName: 'Sunrise Logistics',    personFirstName: 'Wei',     matchStatus: 'ENGAGED',      partnerSlug: 'elevate-consulting',   introSentDaysAgo: 14 },

  // 1 × IMPLEMENTING
  { name: 'Helix Bio — Self-host evaluation', companyName: 'Helix Bio',        personFirstName: 'Maya',    matchStatus: 'IMPLEMENTING', partnerSlug: 'meridian-craft',       introSentDaysAgo: 30 },

  // 1 × COMPLETED
  { name: 'Sunrise — LATAM expansion',    companyName: 'Sunrise Logistics',    personFirstName: 'Wei',     matchStatus: 'COMPLETED',    partnerSlug: 'nine-dots-ventures',   introSentDaysAgo: 60 },

  // 1 × STALLED
  { name: 'Acme RE — annual review',      companyName: 'Acme Real Estate',     personFirstName: 'Camille', matchStatus: 'STALLED',      partnerSlug: 'w3villa-technologies', introSentDaysAgo: 45 },
];
```

- [ ] **Step 11.2: Remove `partnerEligible` from the `data` payload construction**

In the same file, find this block:
```ts
const data: Record<string, unknown> = {
  name: opp.name,
  companyId,
  pointOfContactId: personId,
  partnerEligible: opp.partnerEligible,
};
```
Replace with:
```ts
const data: Record<string, unknown> = {
  name: opp.name,
  companyId,
  pointOfContactId: personId,
  matchStatus: opp.matchStatus,
};
```

And remove the duplicate `data.matchStatus` assignment below it (the conditional `if (opp.matchStatus) { data.matchStatus = opp.matchStatus; }` block becomes redundant — delete it).

- [ ] **Step 11.3: Update the log line**

Find:
```ts
console.log(
  `[seed] created opp ${created.name} (eligible=${opp.partnerEligible}${
    opp.matchStatus ? `, status=${opp.matchStatus}` : ''
  })`,
);
```
Replace with:
```ts
console.log(`[seed] created opp ${created.name} (status=${opp.matchStatus})`);
```

- [ ] **Step 11.4: Update the file's leading comment**

Replace the top-of-file comment block with:
```ts
// Demo data for the partner matching pipeline. Seeds 3 companies, 3 people, and
// 15 opportunities distributed across 9 of the 10 matchStatus values:
//   3 × TO_BE_MATCHED, 2 × MANUAL_MATCH, 1 × AUTO_MATCH,
//   2 × MATCHED, 2 × INTRO_SENT, 2 × ENGAGED,
//   1 × IMPLEMENTING, 1 × COMPLETED, 1 × STALLED.
// CANCELLED is intentionally unpopulated.
//
// Idempotent: skips any company/person/opp that already exists by natural key
// (company.name, person firstName+lastName, opp.name). Safe to re-run.
//
// Run via: yarn vitest run --config vitest.seed.config.ts
// Prereq: seed-marketplace-partners.ts must have run first (partners are looked
// up by slug to wire matched opportunities to real partner records).
```

- [ ] **Step 11.5: Lint**

Run: `yarn lint`
Expected: no errors.

- [ ] **Step 11.6: Commit**

```bash
git add src/scripts/seed-pipeline-demo.ts
git commit -m "feat(seed): redistribute demo opps across new matchStatus enum"
```

---

## Task 12: Update README and BACKLOG

**Files:**
- Modify: `README.md`
- Modify: `BACKLOG.md`

- [ ] **Step 12.1: Update README.md**

In `README.md`, find the Opportunity-extensions bullet that mentions `partnerEligible` and remove `partnerEligible` from the list (leave the others — `matchStatus`, `designDocStatus`, `introSentAt`, etc.).

Find the logic-function bullet `on-opportunity-partner-eligible` and replace it with:
```markdown
  - `on-opportunity-auto-match` — fires when `matchStatus` is set to `AUTO_MATCH`. Assigns the longest-idle available partner and flips status to `MATCHED`. If no partner is available, hands off to `MANUAL_MATCH` with an audit Note explaining why.
```

Find the "Waiting for match" view bullet and replace it with:
```markdown
  - `Waiting for match` — opportunities awaiting human action (`matchStatus` is `TO_BE_MATCHED` or `MANUAL_MATCH`).
```

- [ ] **Step 12.2: Update BACKLOG.md**

In `BACKLOG.md`, find the line referencing `partnerEligible` under field descriptions and remove `partnerEligible` from that entry.

Add a new item at the appropriate section (under feature backlog):
```markdown
- **Manual-match modal**: Front Component widget on the opportunity record page that opens a partner picker (lists `ACTIVE`+`AVAILABLE` partners via `list-available-partners`). On selection, calls a logic function that assigns the partner, flips `matchStatus` to `MATCHED`, and triggers the same post-match side-effects as the auto-match path (audit Note, `lastMatchAt` bump, future email send). Goal: parity between auto and manual paths.
```

- [ ] **Step 12.3: Commit**

```bash
git add README.md BACKLOG.md
git commit -m "docs: align README and BACKLOG with match-status redesign"
```

---

## Task 13: Workspace reset and end-to-end smoke

**Files:** none modified — this task is verification only.

- [ ] **Step 13.1: Reset the local workspace**

Run: `yarn twenty server reset`
Expected: the local Twenty server's data is wiped. The app will be re-installed on the next integration-test run via `appDevOnce()`.

- [ ] **Step 13.2: Run integration tests (re-installs app + verifies logic function)**

Run: `yarn test`
Expected: all tests pass — `schema.integration-test.ts` and both describe blocks in `on-opportunity-auto-match.integration-test.ts`.

- [ ] **Step 13.3: Re-seed marketplace partners (prereq for the pipeline seed)**

Run: `yarn vitest run --config vitest.seed.config.ts src/scripts/seed-marketplace-partners.ts`
Expected: marketplace partners created. (If they already exist, the script skips them.)

- [ ] **Step 13.4: Run the pipeline seed**

Run: `yarn vitest run --config vitest.seed.config.ts src/scripts/seed-pipeline-demo.ts`
Expected: 15 opps created with the new matchStatus distribution. Console logs show `status=<value>` for each.

- [ ] **Step 13.5: UI smoke — flip TO_BE_MATCHED to AUTO_MATCH (happy path)**

In the Twenty UI:
1. Open the Opportunities view.
2. Pick a `TO_BE_MATCHED` opp.
3. Change `Match Status` to `Auto Match`.
4. Wait ~2 seconds and refresh.

Expected: status now `Matched`; partner field populated.

- [ ] **Step 13.6: UI smoke — flip with no partner available (failure path)**

In the Twenty UI:
1. Open the Partners view.
2. Set every `Available` partner to `Unavailable`.
3. Pick another `TO_BE_MATCHED` opp; change `Match Status` to `Auto Match`.
4. Wait ~2 seconds and refresh.

Expected: status now `Manual Match`; partner field empty; a Note titled "Auto-match failed" attached to the opp (visible in the Notes tab on the opportunity record page).

Restore partners to `Available` afterward.

- [ ] **Step 13.7: UI smoke — Kanban**

1. Open `Matches overview`.
2. Switch grouping to Kanban (via the UI; see BACKLOG.md note on `ViewType.KANBAN`).

Expected: every populated column from `AUTO_MATCH` through `STALLED` renders with at least one card.

- [ ] **Step 13.8: Commit any fixes uncovered by smoke tests**

If smoke tests revealed issues, fix them and commit. Otherwise, no commit needed.

---

## Done

At the end of Task 13 the redesign is complete and verified. Summary of what changed:
- `partnerEligible` boolean field removed.
- `matchStatus` enum expanded from 7 nullable values to 10 non-nullable values with `TO_BE_MATCHED` as the default.
- Matching trigger moved from `partnerEligible` flip to `matchStatus = AUTO_MATCH`.
- Failure path creates an audit Note and hands off to `MANUAL_MATCH`.
- Four views rebased onto `matchStatus` filters; "All partner deals" renamed to "All matched deals".
- Seed script populates 9 of the 10 status values for full Kanban demonstration.
- README and BACKLOG updated; manual-match modal queued as a follow-up spec.
