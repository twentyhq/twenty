# XO Pure Ambassador ADK Capability Report

## Scope

This report maps the current ambassador subsystem in `packages/twenty-apps/internal/xopure-crm` to:

- the ambassador access-control plan in `docs/ambassador-access-control.md`
- the XO Pure integration plan in `plan.md`
- the Twenty ADK plugin lifecycle (build/sync/deploy/install/runtime)

## What the ambassador subsystem does today

### 1) Hierarchical ambassador access model is implemented

The current role model matches the intended admin/manager/rep hierarchy:

- **Ambassador Rep** role (`src/roles/ambassador-rep.role.ts`) scopes visibility to records where the record's `assignedAmbassador` is the current workspace member.
- **Ambassador Manager** role (`src/roles/ambassador-manager.role.ts`) scopes visibility to records where `assignedAmbassador == current member OR supervisor == current member`.
- **Ownership/supervisor fields are read-only** for these roles via field-level permissions.

Core implementation is centralized in:

- `src/roles/ambassador-row-permissions.ts`
- `src/roles/ambassador-row-permissions.spec.ts`

### 2) Restricted-object coverage is broad and explicit

Row-level predicates are applied across the operational surfaces used by ambassador workflows:

- ambassador profiles
- people
- customers
- orders
- commissions
- retail prospects
- influencer prospects
- enrichment tasks

This is implemented as a single restricted object map in `src/roles/ambassador-row-permissions.ts`.

### 3) Ownership model uses denormalized supervisor fields

The plan's denormalization decision is encoded in field design:

- direct owner relation (`assignedAmbassador`)
- direct manager relation (`supervisor`)

Examples:

- `src/fields/person-assigned-ambassador.field.ts`
- `src/fields/person-supervisor.field.ts`
- analogous pairs on order/customer/commission/prospects/enrichment-task

Ambassador profile also includes explicit workspace-member links:

- `workspaceMember` on ambassador profile (`src/fields/ambassador-workspace-member.field.ts`)
- `managerWorkspaceMember` on ambassador profile (`src/fields/ambassador-manager-workspace-member.field.ts`)

### 4) Manager/rep/admin operating views exist

Role-oriented views are present and aligned to operating intent:

- Rep: `My Leads`, `My Commissions`
- Manager: `My Team Leads`, `Team Commissions`, `Ambassador Roster`
- Admin triage: `Unassigned / Needs Triage`

Files live under `src/views/*ambassador*` and supporting role-focused views in `src/views/`.

### 5) Ambassador domain data is represented end-to-end

Ambassador profile object (`src/objects/xopure-ambassador.object.ts`) includes:

- lifecycle status
- level/tier
- referral code
- attribution and commission rollups
- research summary

Associated objects (customer/order/commission/prospects/enrichment) include fields needed for assignment, segmentation, and sync attribution.

## Additional capabilities already in the same ADK app

Beyond ambassador access itself, the app already includes:

- **Prospecting systems** (retail + influencer objects)
- **Sequence + trigger modeling** (`xopureEmailSequence`, `xopureAutomationTrigger`)
- **Agent/skill definitions** for enrichment and sequence strategy (`src/agents/*`, `src/skills/*`)
- **Sync and enrichment HTTP route logic functions** (currently normalization/auth stubs):
  - `src/logic-functions/supabase-sync-webhook.ts`
  - `src/logic-functions/create-enrichment-task.ts`
- **App-level variables** for sync secret and enrichment provider:
  - `src/application-config.ts`

## How this interacts with Twenty CRM’s plugin/ADK system

This package is a **Twenty ADK app** (metadata-driven plugin), not a custom patch to Twenty core.

### Authoring model

The app uses `define*` entities from `twenty-sdk/define`:

- `defineApplication`
- `defineObject`
- `defineField`
- `defineRole`
- `defineView`
- `defineLogicFunction`
- `defineSkill`
- `defineAgent`
- `defineNavigationMenuItem`

### Build + manifest extraction

ADK build scans TypeScript source for `export default define*()` and maps them into manifest entity groups:

- extractor: `packages/twenty-sdk/src/cli/utilities/build/manifest/manifest-extract-config.ts`
- builder: `packages/twenty-sdk/src/cli/utilities/build/manifest/manifest-build.ts`

### Sync path (dev/runtime metadata update)

The CLI syncs generated manifest to Twenty via metadata GraphQL mutation:

- `syncApplication(manifest)` in `application-api.ts`
- endpoint: `/metadata`

### Deploy/install path

- Tarball upload: `uploadAppTarball` mutation (`file-api.ts`)
- Install by app universal ID: `installMarketplaceApp` mutation (`file-api.ts`)

### Runtime effect inside Twenty

Once synced/installed, Twenty enforces:

- role object permissions
- field permissions
- row-level predicate groups/predicates
- views/navigation/entities/logic functions

No direct internal DB patching is required for these behaviors.

## Comparison against plan: implemented vs remaining

## Implemented

- Hierarchical manager/rep row-level model and role definitions
- Denormalized assigned/supervisor relations on restricted objects
- Manager/rep/admin operating views
- Ambassador/customer/order/commission/prospect/task domain modeling
- Initial sync/enrichment route stubs with payload normalization and auth gate

## Remaining gaps

1. **Automation invariants are not fully implemented yet**
   - no complete automation/backfill path ensuring supervisor always mirrors assigned ambassador manager
   - no manager-change propagation backfill for active records

2. **Sync logic is still stub-level**
   - `supabase-sync-webhook.ts` returns normalized payload/next-step guidance, but not production upsert + `crm_sync_map` writes

3. **Access scope can still expand to sensitive timeline surfaces**
   - plan includes notes/activity consideration; current restricted set does not yet explicitly include those surfaces

4. **Role verification is unit-level, not full fixture smoke test**
   - permissions spec validates predicate config shape, but not full end-to-end role behavior with admin/manager/rep fixture users

5. **Plan status document has drift**
   - `plan.md` still reports 1 role in manifest status section while repo currently defines default + ambassador manager + ambassador rep roles

## High-signal unlocks beyond ambassador system

1. **Production sync engine unlock**
   - complete idempotent Supabase→Twenty upsert/backfill + reconciliation using `crm_sync_map`
   - this unlocks reliable real-time ownership + manager visibility coherence

2. **Cron-based reconciliation unlock**
   - use ADK cron trigger support to run periodic drift repair (assignment/supervisor integrity + sync lag checks)

3. **Workflow-action unlock**
   - expose enrichment/sync functions via workflow action trigger settings so operations can orchestrate in Twenty workflow builder

4. **AI tooling unlock**
   - expose targeted logic functions as tool triggers for controlled agent execution (bounded by role + input schemas)

5. **Install lifecycle unlock**
   - use pre/post-install logic functions for deterministic migrations/backfills during app upgrade

6. **Role-aware UI extension unlock**
   - add front components/page layouts/command menu actions for manager triage, queue review, and assignment QA without broadening permissions

## Recommended execution order

1. Finish sync core (idempotent upsert + `crm_sync_map` writes + attribution resolution)
2. Enforce assignment/supervisor invariants + backfill logic
3. Add fixture-based permission smoke suite
4. Add cron reconciliation and alerting
5. Expose selective workflow/tool triggers
6. Add operator UI components for triage and correction

## Evidence sources

- `docs/ambassador-access-control.md`
- `plan.md`
- `packages/twenty-apps/internal/xopure-crm/src/roles/*`
- `packages/twenty-apps/internal/xopure-crm/src/fields/*assigned-ambassador*`
- `packages/twenty-apps/internal/xopure-crm/src/fields/*supervisor*`
- `packages/twenty-apps/internal/xopure-crm/src/views/*`
- `packages/twenty-apps/internal/xopure-crm/src/logic-functions/*`
- `packages/twenty-sdk/src/cli/utilities/build/manifest/*`
- `packages/twenty-sdk/src/cli/utilities/api/{application-api.ts,file-api.ts}`
