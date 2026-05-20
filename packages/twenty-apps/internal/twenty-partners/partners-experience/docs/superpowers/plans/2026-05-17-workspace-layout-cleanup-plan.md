# Workspace Layout Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the Twenty sidebar to surface partner views first, add two new partner-workflow views (Waiting for match + Matches kanban), define two new human roles (Twenty Partner Ops + Partner placeholder), define an explicit Partner record page layout, and ship a demo seed script populating opportunities across every workflow state.

**Architecture:** All config-as-code via `twenty-sdk/define`. Seven new files + five edits under `src/`. Each task ends with `yarn twenty dev --once` to verify the manifest builds, followed by a commit. No runtime logic, no HTTP endpoints. The only "test" is the manifest sync — there is no unit-test pattern for static SDK definitions in this codebase.

**Tech Stack:** `twenty-sdk@2.5.0` (`defineRole`, `defineView`, `defineNavigationMenuItem`, `definePageLayout`), `twenty-client-sdk@2.5.0` (`CoreApiClient`), vitest for the seed script.

**Reference spec:** `partners-experience/docs/superpowers/specs/2026-05-17-workspace-layout-cleanup-design.md`

---

## Pre-flight check

Run once before starting:

```bash
yarn twenty server status
```

Expected: `Status: running (healthy)`. If not, run `yarn twenty server start`.

```bash
yarn twenty dev --once
```

Expected: `✓ Synced Twenty partners (5 files)`. Baseline confirms the existing manifest builds cleanly.

---

## Task 1: Add new top-level UIDs to constants

**Files:**
- Modify: `src/constants/universal-identifiers.ts`

- [ ] **Step 1: Append 7 new UID constants**

Open `src/constants/universal-identifiers.ts`. Append these exports after the existing ones (do not remove any existing line):

```ts
// Roles (Task 2)
export const TWENTY_PARTNER_OPS_ROLE_UNIVERSAL_IDENTIFIER = '3340ca65-863d-4cdc-95c9-8abdec13d0f6';
export const PARTNER_ROLE_UNIVERSAL_IDENTIFIER = 'c3c1dc2e-1a08-4de5-abb7-2139b3d99343';

// Views (Task 3)
export const WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER = 'fe11e738-6bf3-4714-929c-51c76a3fd050';
export const MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER = '5a8fd51a-cf9e-4a6a-b1b4-b833b215fc1c';

// Nav items (Task 5)
export const WAITING_FOR_MATCH_NAV_UNIVERSAL_IDENTIFIER = '00be7449-8927-47c8-a6a1-212d9106587f';
export const MATCHES_OVERVIEW_NAV_UNIVERSAL_IDENTIFIER = '0cf349c9-fcbf-40f8-8e91-142c02bbde9c';

// Page layout (Task 6)
export const PARTNER_RECORD_PAGE_UNIVERSAL_IDENTIFIER = 'a888b39e-d64a-48ba-a044-d8cb685fad74';
```

- [ ] **Step 2: Verify the file parses (no sync yet — these are just constants)**

Run: `yarn lint`
Expected: no errors related to the new file.

- [ ] **Step 3: Commit**

```bash
git add src/constants/universal-identifiers.ts
git commit -m "Add UIDs for new roles, views, nav items, page layout"
```

---

## Task 2: Define the two new roles (Twenty Partner Ops + Partner placeholder)

**Files:**
- Create: `src/roles/twenty-partner-ops.role.ts`
- Create: `src/roles/partner.role.ts`

**Reference**: `/Users/rashadkaranouh/twenty/carte-postale/src/roles/rk.ts` (pattern for `defineRole`)

- [ ] **Step 1: Create `src/roles/twenty-partner-ops.role.ts`**

```ts
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineRole } from 'twenty-sdk/define';

import {
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  TWENTY_PARTNER_OPS_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineRole({
  universalIdentifier: TWENTY_PARTNER_OPS_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Twenty Partner Ops',
  description:
    'Internal Twenty teammate role for managing partners and matched deals. Full read/write on Partner, Company, Person, Opportunity. No access to Tasks/Notes/Workflows. No settings access.',
  icon: 'IconUsersGroup',
  canBeAssignedToUsers: true,
  canUpdateAllSettings: false,
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  objectPermissions: [
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
});
```

- [ ] **Step 2: Create `src/roles/partner.role.ts`**

```ts
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineRole } from 'twenty-sdk/define';

import {
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineRole({
  universalIdentifier: PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Partner',
  description:
    'PLACEHOLDER. External partner self-service role. Sees ALL Partner/Opportunity records today because Twenty does not yet support row-level record filtering. When RLP ships, scope these permissions to records owned by the assigned user. DO NOT assign to real external partners until then.',
  icon: 'IconBuildingStore',
  canBeAssignedToUsers: false,
  canUpdateAllSettings: false,
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  objectPermissions: [
    {
      objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
});
```

- [ ] **Step 3: Sync and verify**

Run: `yarn twenty dev --once`
Expected: output includes `✓ src/roles/twenty-partner-ops.role.ts` and `✓ src/roles/partner.role.ts` in the Roles section.

- [ ] **Step 4: Visual verification (manual)**

Open `http://localhost:2020/settings/roles`. Confirm two new roles appear in the list: `Twenty Partner Ops` and `Partner`. The `Partner` role should show the placeholder description and be flagged as not-assignable (the assignment UI should be disabled or hidden).

- [ ] **Step 5: Commit**

```bash
git add src/roles/twenty-partner-ops.role.ts src/roles/partner.role.ts
git commit -m "Add Twenty Partner Ops role and Partner placeholder role"
```

---

## Task 3: Create the two new views (Waiting for match + Matches overview)

**Files:**
- Create: `src/views/waiting-for-match.view.ts`
- Create: `src/views/matches-overview.view.ts`

**Standard field UIDs used** (looked up from `STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields`):
- Opportunity `name`: `20202020-8609-4f65-a2d9-44009eb422b5`
- Opportunity `createdAt`: `20202020-d01b-4132-9b32-123456789abc`
- Opportunity `company` (relation): `20202020-cbac-457e-b565-adece5fc815f`

**Custom field UIDs used** (from existing files):
- Opportunity `partnerEligible`: `eeb2c35d-9ecf-41e3-a36f-55b756687d02`
- Opportunity `matchStatus`: `d8dd0623-3a4c-4ab3-a1e0-4ece7df24fb2`
- Opportunity `designDocStatus`: `cc6b8a59-f860-493f-8b9a-f138c078fbf1`
- Opportunity `introSentAt`: `fcf39b0c-0547-415e-806d-b238131ad7cc`
- Opportunity `partner` (MANY_TO_ONE): `d9eeacaa-2f9e-44cc-b5f6-5e1526256d49`

- [ ] **Step 1: Create `src/views/waiting-for-match.view.ts`**

```ts
import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import { WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Waiting for match',
  icon: 'IconClockHour4',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  fields: [
    {
      universalIdentifier: 'd74b5eb3-21ee-48fa-b703-4cfd629738b4',
      fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '50822cf9-c238-4450-ba31-5807011afa65',
      fieldMetadataUniversalIdentifier: '20202020-cbac-457e-b565-adece5fc815f',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'f432a71f-3bd0-495e-b5b1-8a78e155dc5a',
      fieldMetadataUniversalIdentifier: '20202020-d01b-4132-9b32-123456789abc',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '9e47592f-9965-4ee7-9c6a-303477b293f4',
      fieldMetadataUniversalIdentifier: 'cc6b8a59-f860-493f-8b9a-f138c078fbf1',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '909e1eee-077a-4f23-8c9b-4c8027623a78',
      fieldMetadataUniversalIdentifier: 'eeb2c35d-9ecf-41e3-a36f-55b756687d02',
      position: 4,
      isVisible: true,
    },
  ],
  filters: [
    {
      universalIdentifier: 'ba711bf1-e4a9-4178-b0f4-28f9d74cc95a',
      fieldMetadataUniversalIdentifier: 'eeb2c35d-9ecf-41e3-a36f-55b756687d02',
      operand: ViewFilterOperand.IS,
      value: 'true',
    },
    {
      universalIdentifier: '93476207-1471-49d9-898c-f8a1d52f468f',
      fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49',
      operand: ViewFilterOperand.IS_EMPTY,
      value: '',
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

- [ ] **Step 2: Create `src/views/matches-overview.view.ts`**

```ts
import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import { MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Matches overview',
  icon: 'IconLayoutKanban',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.KANBAN,
  mainGroupByFieldMetadataUniversalIdentifier:
    'd8dd0623-3a4c-4ab3-a1e0-4ece7df24fb2',
  fields: [
    {
      universalIdentifier: '7a6403c1-7ab9-4c3a-b833-3c028d43140e',
      fieldMetadataUniversalIdentifier: '20202020-8609-4f65-a2d9-44009eb422b5',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '2e718b4b-fde8-4839-9cdf-deb09db0e6b6',
      fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '5ae8805c-3d71-4ccc-a2be-38368f32e3e1',
      fieldMetadataUniversalIdentifier: 'd8dd0623-3a4c-4ab3-a1e0-4ece7df24fb2',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: 'cb4e5d2b-7003-4f30-874c-acda310b250c',
      fieldMetadataUniversalIdentifier: 'fcf39b0c-0547-415e-806d-b238131ad7cc',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '0fc87e70-7aa1-4c85-9152-d0edff8ae8a4',
      fieldMetadataUniversalIdentifier: 'cc6b8a59-f860-493f-8b9a-f138c078fbf1',
      position: 4,
      isVisible: true,
    },
  ],
  filters: [
    {
      universalIdentifier: 'c2556a69-5ee7-4e1c-a5e5-ed277ae7e3e0',
      fieldMetadataUniversalIdentifier: 'd9eeacaa-2f9e-44cc-b5f6-5e1526256d49',
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      value: '',
    },
  ],
});
```

- [ ] **Step 3: Sync and verify the views build**

Run: `yarn twenty dev --once`
Expected: both view files show `✓` in the Views section. If `IS_EMPTY` / `IS_NOT_EMPTY` on a relation field errors, fall back to using `IS_NULL` / `IS_NOT_NULL` (the ViewFilterOperand enum has IS_NOT_NULL but the corresponding IS_NULL appears via inverse logic — try `value: 'null'` with `IS` operand if the empty operands fail).

- [ ] **Step 4: Commit**

```bash
git add src/views/waiting-for-match.view.ts src/views/matches-overview.view.ts
git commit -m "Add Waiting for match table view and Matches overview kanban"
```

---

## Task 4: Edit the two existing views (all-partners + partner-eligible-opportunities)

**Files:**
- Modify: `src/views/all-partners.view.ts`
- Modify: `src/views/partner-eligible-opportunities.view.ts`

- [ ] **Step 1: Edit `src/views/all-partners.view.ts` — add 2 columns + 1 filter**

Open the file. The current `fields` array has 5 entries (positions 0-4). Add two more entries at positions 5 and 6 for `servedGeos` and `deploymentExpertise`. Then add a `filters` array (if not present) with a single entry hiding REJECTED partners.

Replace the existing `defineView({ ... })` block with:

```ts
import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import {
  ALL_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: ALL_PARTNERS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partners',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  fields: [
    { universalIdentifier: '21afcc69-09c5-42eb-a609-26c062de3bd3', fieldMetadataUniversalIdentifier: 'a0000001-0000-4000-8000-000000000001', position: 0, isVisible: true },
    { universalIdentifier: '529912f0-38fb-4821-92d3-8a0a68b9f340', fieldMetadataUniversalIdentifier: 'a0000003-0000-4000-8000-000000000003', position: 1, isVisible: true },
    { universalIdentifier: '68c6b96d-8c3d-4a3e-b4cd-3751d035b085', fieldMetadataUniversalIdentifier: 'a0000004-0000-4000-8000-000000000004', position: 2, isVisible: true },
    { universalIdentifier: '8862e4a5-525a-4a0c-8381-93ff0d01ccf0', fieldMetadataUniversalIdentifier: 'a0000007-0000-4000-8000-000000000007', position: 3, isVisible: true },
    { universalIdentifier: '4ebe0b9d-0c2d-4416-b187-150b02473a01', fieldMetadataUniversalIdentifier: 'a0000010-0000-4000-8000-000000000010', position: 4, isVisible: true },
    { universalIdentifier: '52408b5f-5e13-4e3c-af2d-ce50033ec126', fieldMetadataUniversalIdentifier: 'a0000006-0000-4000-8000-000000000006', position: 5, isVisible: true },
    { universalIdentifier: '02cc471b-e9ba-4643-b403-40299d6bbbdd', fieldMetadataUniversalIdentifier: 'a0000005-0000-4000-8000-000000000005', position: 6, isVisible: true },
  ],
  filters: [
    {
      universalIdentifier: '9bd6f154-a9fe-47cc-9675-14d2d4f6f0d3',
      fieldMetadataUniversalIdentifier: 'a0000003-0000-4000-8000-000000000003',
      operand: ViewFilterOperand.IS_NOT,
      value: 'REJECTED',
    },
  ],
});
```

- [ ] **Step 2: Edit `src/views/partner-eligible-opportunities.view.ts` — rename only**

Change exactly one line — the `name` field. From `name: 'Partner deals'` to `name: 'All partner deals'`. Make no other changes.

- [ ] **Step 3: Sync and verify**

Run: `yarn twenty dev --once`
Expected: both view files re-sync (`✓`).

- [ ] **Step 4: Commit**

```bash
git add src/views/all-partners.view.ts src/views/partner-eligible-opportunities.view.ts
git commit -m "Expand Partners view columns + rename Partner deals view"
```

---

## Task 5: Reorder nav (2 edits + 2 new nav items)

**Files:**
- Modify: `src/navigation-menu-items/partners.navigation-menu-item.ts`
- Modify: `src/navigation-menu-items/partner-deals.navigation-menu-item.ts`
- Create: `src/navigation-menu-items/waiting-for-match.navigation-menu-item.ts`
- Create: `src/navigation-menu-items/matches-overview.navigation-menu-item.ts`

**Target order** (low position = top of sidebar):
| Position | Nav item | View |
|---|---|---|
| 0 | Waiting for match | waiting-for-match.view |
| 1 | All partner deals | partner-eligible-opportunities.view |
| 2 | Matches overview | matches-overview.view |
| 3 | Partners | all-partners.view |

- [ ] **Step 1: Edit `src/navigation-menu-items/partners.navigation-menu-item.ts`**

Change `position: 10` to `position: 3`. Make no other changes.

- [ ] **Step 2: Edit `src/navigation-menu-items/partner-deals.navigation-menu-item.ts`**

Change `position: 11` to `position: 1`. Make no other changes.

- [ ] **Step 3: Create `src/navigation-menu-items/waiting-for-match.navigation-menu-item.ts`**

```ts
import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  WAITING_FOR_MATCH_NAV_UNIVERSAL_IDENTIFIER,
  WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: WAITING_FOR_MATCH_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconClockHour4',
  position: 0,
  viewUniversalIdentifier: WAITING_FOR_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
});
```

- [ ] **Step 4: Create `src/navigation-menu-items/matches-overview.navigation-menu-item.ts`**

```ts
import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import {
  MATCHES_OVERVIEW_NAV_UNIVERSAL_IDENTIFIER,
  MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: MATCHES_OVERVIEW_NAV_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconLayoutKanban',
  position: 2,
  viewUniversalIdentifier: MATCHES_OVERVIEW_VIEW_UNIVERSAL_IDENTIFIER,
});
```

- [ ] **Step 5: Sync and verify**

Run: `yarn twenty dev --once`
Expected: 4 nav items show `✓` in the Navigation menu items section.

- [ ] **Step 6: Visual verification (manual)**

Open `http://localhost:2020`. The sidebar should show in this top-down order: Waiting for match → All partner deals → Matches overview → Partners → [native items below]. Click each — they should open the correct view.

- [ ] **Step 7: Commit**

```bash
git add src/navigation-menu-items/
git commit -m "Reorder sidebar: partner workflow items at top"
```

---

## Task 6: Define the Partner record page layout

**Files:**
- Create: `src/page-layouts/partner-record-page.page-layout.ts`

**Reference**: `/Users/rashadkaranouh/twenty/carte-postale/src/page-layouts/quote-record-page.page-layout.ts` (pattern for `definePageLayout`)

- [ ] **Step 1: Create the page layout file**

```ts
import { PageLayoutTabLayoutMode, definePageLayout } from 'twenty-sdk/define';

import {
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  PARTNER_RECORD_PAGE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: PARTNER_RECORD_PAGE_UNIVERSAL_IDENTIFIER,
  name: 'Partner Record Page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: '673d5a79-673d-4d41-8609-eff002fd1ea6',
      title: 'Profile',
      position: 0,
      icon: 'IconList',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: '79b02cd5-0003-4cc1-a8d4-4344a3ed4c49',
          title: 'Partner Fields',
          type: 'FIELDS',
          configuration: {
            configurationType: 'FIELDS',
          },
        },
      ],
    },
  ],
});
```

- [ ] **Step 2: Sync and verify**

Run: `yarn twenty dev --once`
Expected: a Page layouts section appears in the output with `✓ src/page-layouts/partner-record-page.page-layout.ts`.

- [ ] **Step 3: Visual verification (manual)**

Open `http://localhost:2020`, navigate to Partners, click any partner record. Confirm:
1. The page renders with a "Profile" tab containing the partner's fields
2. Tabs for "Opportunities" and "Persons" appear automatically (from the reverse relations defined on the Partner object)

**If only the Profile tab renders (no relation tabs)**: Twenty suppresses auto-relation tabs when a page layout is defined. In that case, add two additional tabs with `RECORD_TABLE` widgets. The exact additional config is:

```ts
// After the Profile tab, add:
{
  universalIdentifier: 'a307f45a-50cc-4ba2-a76a-998e77e2f9a1',
  title: 'Opportunities',
  position: 1,
  icon: 'IconTargetArrow',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: '6834ec27-4093-4c4b-9507-64bfd6a7935e',
      title: 'Partner Opportunities',
      type: 'RECORD_TABLE',
      configuration: {
        configurationType: 'RECORD_TABLE',
      },
    },
  ],
},
{
  universalIdentifier: '23810659-14cf-41d0-a87b-569344566a21',
  title: 'Persons',
  position: 2,
  icon: 'IconUser',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: '884d4042-6fa5-44b1-96c4-743b41373c1b',
      title: 'Partner Persons',
      type: 'RECORD_TABLE',
      configuration: {
        configurationType: 'RECORD_TABLE',
      },
    },
  ],
},
```

Re-sync and re-check. If `RECORD_TABLE` without a `viewId` does not auto-scope to the related records, the workaround is to leave the page layout with only the Profile tab and accept that users navigate to Opportunities via the in-page relation chip in the field panel.

- [ ] **Step 4: Commit**

```bash
git add src/page-layouts/partner-record-page.page-layout.ts
git commit -m "Add Partner record page layout"
```

---

## Task 7: Demo seed script for companies + persons + opportunities

**Files:**
- Create: `src/scripts/seed-pipeline-demo.ts`

**Reference**: `src/scripts/seed-marketplace-partners.ts` (existing pattern for vitest-based seed scripts).

**Filename rationale**: `seed-pipeline-demo.ts` sorts alphabetically AFTER `seed-marketplace-partners.ts` (`m` < `p`). With `vitest.seed.config.ts` setting `fileParallelism: false`, vitest runs files in discovery order — alphabetical by default — so partners get seeded before this script runs, and the partner-slug lookups succeed.

**Standard mutation field shapes** (verified against `src/logic-functions/post-install.ts`):
- Company mutation: `createCompany(data: { name: '...', domainName: { primaryLinkUrl: '...' } })`
- Person mutation: `createPerson(data: { name: { firstName: '...', lastName: '...' }, companyId: '<uuid>' })`
- Opportunity mutation: `createOpportunity(data: { name: '...', companyId: '<uuid>', pointOfContactId: '<uuid>', partnerEligible: bool, partnerId?: '<uuid>', matchStatus?: '...', introSentAt?: '...' })`

- [ ] **Step 1: Create the seed script**

```ts
import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, it } from 'vitest';

type CompanySeed = { name: string; domain: string };
type PersonSeed = { firstName: string; lastName: string; companyName: string };
type OpportunitySeed = {
  name: string;
  companyName: string;
  personFirstName: string;
  partnerEligible: boolean;
  partnerSlug?: string;
  matchStatus?:
    | 'DELIVERED'
    | 'INTRO_SENT'
    | 'ENGAGED'
    | 'IMPLEMENTING'
    | 'COMPLETED'
    | 'STALLED'
    | 'CANCELLED';
  introSentDaysAgo?: number;
};

const COMPANIES: CompanySeed[] = [
  { name: 'Acme Real Estate', domain: 'https://acmerealestate.example' },
  { name: 'Helix Bio', domain: 'https://helixbio.example' },
  { name: 'Sunrise Logistics', domain: 'https://sunriselogistics.example' },
];

const PERSONS: PersonSeed[] = [
  { firstName: 'Camille', lastName: 'Durand', companyName: 'Acme Real Estate' },
  { firstName: 'Maya', lastName: 'Patel', companyName: 'Helix Bio' },
  { firstName: 'Wei', lastName: 'Chen', companyName: 'Sunrise Logistics' },
];

// 15 opportunities: 6 partner-eligible (40%) + 9 raw (60%)
const OPPORTUNITIES: OpportunitySeed[] = [
  // 6 partner-eligible
  {
    name: 'Acme RE — CRM rollout (waiting)',
    companyName: 'Acme Real Estate',
    personFirstName: 'Camille',
    partnerEligible: true,
  },
  {
    name: 'Helix Bio — Sales ops migration',
    companyName: 'Helix Bio',
    personFirstName: 'Maya',
    partnerEligible: true,
    partnerSlug: 'elevate-consulting',
    matchStatus: 'DELIVERED',
  },
  {
    name: 'Sunrise — APAC fleet CRM',
    companyName: 'Sunrise Logistics',
    personFirstName: 'Wei',
    partnerEligible: true,
    partnerSlug: 'meridian-craft',
    matchStatus: 'INTRO_SENT',
    introSentDaysAgo: 3,
  },
  {
    name: 'Acme RE — WhatsApp integration',
    companyName: 'Acme Real Estate',
    personFirstName: 'Camille',
    partnerEligible: true,
    partnerSlug: 'nine-dots-ventures',
    matchStatus: 'ENGAGED',
    introSentDaysAgo: 10,
  },
  {
    name: 'Helix Bio — Self-host evaluation',
    companyName: 'Helix Bio',
    personFirstName: 'Maya',
    partnerEligible: true,
    partnerSlug: 'w3villa-technologies',
    matchStatus: 'IMPLEMENTING',
    introSentDaysAgo: 30,
  },
  {
    name: 'Sunrise — LATAM expansion',
    companyName: 'Sunrise Logistics',
    personFirstName: 'Wei',
    partnerEligible: true,
    partnerSlug: 'netzero-systems',
    matchStatus: 'COMPLETED',
    introSentDaysAgo: 60,
  },
  // 9 raw opportunities — partnerEligible: false, no partner
  { name: 'Acme RE — Q3 renewal', companyName: 'Acme Real Estate', personFirstName: 'Camille', partnerEligible: false },
  { name: 'Acme RE — agent training', companyName: 'Acme Real Estate', personFirstName: 'Camille', partnerEligible: false },
  { name: 'Helix Bio — clinical trials CRM', companyName: 'Helix Bio', personFirstName: 'Maya', partnerEligible: false },
  { name: 'Helix Bio — investor reporting', companyName: 'Helix Bio', personFirstName: 'Maya', partnerEligible: false },
  { name: 'Helix Bio — pipeline review', companyName: 'Helix Bio', personFirstName: 'Maya', partnerEligible: false },
  { name: 'Sunrise — driver app sync', companyName: 'Sunrise Logistics', personFirstName: 'Wei', partnerEligible: false },
  { name: 'Sunrise — warehouse rollout', companyName: 'Sunrise Logistics', personFirstName: 'Wei', partnerEligible: false },
  { name: 'Sunrise — vendor onboarding', companyName: 'Sunrise Logistics', personFirstName: 'Wei', partnerEligible: false },
  { name: 'Sunrise — annual review', companyName: 'Sunrise Logistics', personFirstName: 'Wei', partnerEligible: false },
];

describe('seed demo opportunities (companies + persons + opportunities)', () => {
  it('creates companies, persons, and opportunities idempotently', async () => {
    const client = new CoreApiClient();

    // -- Layer 1: Companies (idempotent by name) --
    const companyIds = new Map<string, string>();

    const existingCompanies = await client.query({
      companies: {
        __args: {
          filter: { name: { in: COMPANIES.map((c) => c.name) } },
          first: 100,
        },
        edges: { node: { id: true, name: true } },
      },
    } as any);

    for (const edge of ((existingCompanies?.companies?.edges ?? []) as Array<{
      node: { id: string; name: string };
    }>)) {
      companyIds.set(edge.node.name, edge.node.id);
    }

    for (const company of COMPANIES) {
      if (companyIds.has(company.name)) {
        console.log(`[seed] skip  company ${company.name} (already exists)`);
        continue;
      }
      const result = await client.mutation({
        createCompany: {
          __args: {
            data: {
              name: company.name,
              domainName: { primaryLinkUrl: company.domain },
            },
          },
          id: true,
        },
      } as any);
      const id = (result as any).createCompany.id;
      companyIds.set(company.name, id);
      console.log(`[seed] created company ${company.name} (${id})`);
    }

    // -- Layer 2: Persons (idempotent by firstName+lastName composite) --
    const personIds = new Map<string, string>(); // key = `${firstName} ${lastName}`

    // Fetch by firstName-only filter, then match firstName+lastName in JS
    // (avoids Twenty GraphQL nested composite-filter syntax uncertainty)
    const firstNames = PERSONS.map((p) => p.firstName);
    const existingPersons = await client.query({
      people: {
        __args: {
          filter: { name: { firstName: { in: firstNames } } },
          first: 100,
        },
        edges: {
          node: {
            id: true,
            name: { firstName: true, lastName: true },
          },
        },
      },
    } as any);

    const seedKeys = new Set(
      PERSONS.map((p) => `${p.firstName} ${p.lastName}`),
    );

    for (const edge of ((existingPersons?.people?.edges ?? []) as Array<{
      node: { id: string; name: { firstName: string; lastName: string } };
    }>)) {
      const key = `${edge.node.name.firstName} ${edge.node.name.lastName}`;
      if (seedKeys.has(key)) {
        personIds.set(key, edge.node.id);
      }
    }

    for (const person of PERSONS) {
      const key = `${person.firstName} ${person.lastName}`;
      if (personIds.has(key)) {
        console.log(`[seed] skip  person ${key} (already exists)`);
        continue;
      }
      const companyId = companyIds.get(person.companyName);
      if (!companyId) {
        throw new Error(`Missing company id for ${person.companyName}`);
      }
      const result = await client.mutation({
        createPerson: {
          __args: {
            data: {
              name: {
                firstName: person.firstName,
                lastName: person.lastName,
              },
              companyId,
            },
          },
          id: true,
        },
      } as any);
      const id = (result as any).createPerson.id;
      personIds.set(key, id);
      console.log(`[seed] created person ${key} (${id})`);
    }

    // -- Layer 3a: Lookup all seeded partners by slug --
    const partnerSlugs = OPPORTUNITIES.map((o) => o.partnerSlug).filter(
      (s): s is string => Boolean(s),
    );
    const partnerIds = new Map<string, string>(); // key = slug

    if (partnerSlugs.length > 0) {
      const partnersResult = await client.query({
        partners: {
          __args: {
            filter: { slug: { in: partnerSlugs } },
            first: 100,
          },
          edges: { node: { id: true, slug: true } },
        },
      } as any);
      for (const edge of ((partnersResult?.partners?.edges ?? []) as Array<{
        node: { id: string; slug: string };
      }>)) {
        partnerIds.set(edge.node.slug, edge.node.id);
      }
      for (const slug of partnerSlugs) {
        if (!partnerIds.has(slug)) {
          throw new Error(
            `Partner with slug "${slug}" not found. Run seed-marketplace-partners.ts first.`,
          );
        }
      }
    }

    // -- Layer 3b: Opportunities (idempotent by name) --
    const existingOpps = await client.query({
      opportunities: {
        __args: {
          filter: { name: { in: OPPORTUNITIES.map((o) => o.name) } },
          first: 100,
        },
        edges: { node: { name: true } },
      },
    } as any);

    const existingOppNames = new Set<string>(
      ((existingOpps?.opportunities?.edges ?? []) as Array<{
        node: { name: string };
      }>).map((e) => e.node.name),
    );

    for (const opp of OPPORTUNITIES) {
      if (existingOppNames.has(opp.name)) {
        console.log(`[seed] skip  opp ${opp.name} (already exists)`);
        continue;
      }
      const companyId = companyIds.get(opp.companyName);
      if (!companyId) {
        throw new Error(`Missing company id for ${opp.companyName}`);
      }
      const personKey = `${opp.personFirstName} ${PERSONS.find((p) => p.firstName === opp.personFirstName)?.lastName ?? ''}`;
      const personId = personIds.get(personKey.trim());
      if (!personId) {
        throw new Error(`Missing person id for ${personKey}`);
      }

      const data: Record<string, unknown> = {
        name: opp.name,
        companyId,
        pointOfContactId: personId,
        partnerEligible: opp.partnerEligible,
      };

      if (opp.partnerSlug) {
        data.partnerId = partnerIds.get(opp.partnerSlug);
      }
      if (opp.matchStatus) {
        data.matchStatus = opp.matchStatus;
      }
      if (opp.introSentDaysAgo !== undefined) {
        const d = new Date();
        d.setDate(d.getDate() - opp.introSentDaysAgo);
        data.introSentAt = d.toISOString();
      }

      const result = await client.mutation({
        createOpportunity: {
          __args: { data },
          id: true,
          name: true,
        },
      } as any);
      const created = (result as any).createOpportunity;
      console.log(
        `[seed] created opp ${created.name} (eligible=${opp.partnerEligible}${
          opp.matchStatus ? `, status=${opp.matchStatus}` : ''
        })`,
      );
    }
  });
});
```

- [ ] **Step 2: Run the seed script**

Run: `yarn vitest run --config vitest.seed.config.ts`
Expected output includes (in addition to the existing partners seed):
- `[seed] created company Acme Real Estate (...)` (3 companies)
- `[seed] created person Camille Durand (...)` (3 persons)
- `[seed] created opp Acme RE — CRM rollout (waiting) (eligible=true)` (15 opportunities, 6 eligible + 9 raw)

Test result: 2 passed (the existing partners seed + this new one).

- [ ] **Step 3: Re-run to verify idempotency**

Run: `yarn vitest run --config vitest.seed.config.ts`
Expected: every row now logs `[seed] skip ... (already exists)`. Test still passes.

- [ ] **Step 4: Visual verification (manual)**

Open `http://localhost:2020`:
1. **Waiting for match view** — 1 opportunity visible ("Acme RE — CRM rollout (waiting)")
2. **All partner deals view** — 6 opportunities visible (all `partnerEligible=true`)
3. **Matches overview kanban** — populated columns: DELIVERED (1), INTRO_SENT (1), ENGAGED (1), IMPLEMENTING (1), COMPLETED (1). STALLED and CANCELLED empty.
4. **Standard Opportunities view** (native, in sidebar) — all 15 opportunities visible
5. **Partners view** — open "Elevate Consulting" → Opportunities tab shows "Helix Bio — Sales ops migration"
6. **Live trigger** — take any raw opportunity (e.g. "Acme RE — Q3 renewal"), open it, flip `partnerEligible` to true, save → within ~5s it appears in "Matches overview" under DELIVERED

- [ ] **Step 5: Commit**

```bash
git add src/scripts/seed-pipeline-demo.ts
git commit -m "Add demo opportunities seed: 6 eligible + 9 raw across kanban columns"
```

---

## Task 8: Push

- [ ] **Step 1: Push to remote**

```bash
git push
```

- [ ] **Step 2: Verify on GitHub**

Open `https://github.com/twentyhq/twenty-partners` and confirm the 7 new commits appear on `main`.

---

## Verification checklist (after all tasks)

After all tasks complete and the workspace is freshly synced:

- [ ] `yarn twenty dev --once` runs clean (no errors)
- [ ] Sidebar order: Waiting for match → All partner deals → Matches overview → Partners → [native items]
- [ ] Partners view shows 6 partners, with `servedGeos` and `deploymentExpertise` columns, REJECTED hidden
- [ ] Partner record page renders with Profile tab + (auto or explicit) Opportunities and Persons tabs
- [ ] Waiting for match: 1 opportunity
- [ ] All partner deals: 6 opportunities
- [ ] Matches overview kanban: 5 populated columns
- [ ] Settings → Roles shows: Admin (built-in), Twenty Partner Ops, Partner (placeholder, not-assignable)
- [ ] Live matching trigger: flipping a raw opportunity's `partnerEligible` to true assigns a partner within ~5s

## Role test (separate session — requires manual UI step)

Once the above is verified, follow the "How to test the roles" section of the spec (`partners-experience/docs/superpowers/specs/2026-05-17-workspace-layout-cleanup-design.md`) to invite a `partner-ops-test@apple.dev` user, assign them the Twenty Partner Ops role (and remove default Admin), and confirm they see only the 4 partner views + 3 native objects (Companies/People/Opportunities) — no Tasks/Notes/Workflows.

---

**End of implementation plan.**
