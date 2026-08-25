# Apply to Brief — a manifest action

Scope: move the partner apply path from a hand-built workspace workflow into the app
manifest. A command menu item on Opportunity opens a front component. The front component
calls an app route. The route creates the Application under the application role.

The goal is one property: a partner cannot create a bare Application by hand.

## Why the workflow cannot give you this

An insert checks `canUpdateObjectRecords` (`permissions.utils.ts:164`). There is no separate
create permission. A manual-trigger workflow runs under the clicking user's role
(`workflow-execution-context.service.ts:40`), so the partner must hold that flag, and the
same flag lets them press "New record" on the Applications table.

An app route can run the logic function under the `Twenty partners default function role`,
which holds `canUpdateAllObjectRecords: true`. So the partner needs no write permission at
all. This is the only configuration that closes the hole.

Warning: the route only reaches that role when it does **not** declare `isAuthRequired:
true`. An auth-required route passes the caller's user id into the executor
(`route-trigger.service.ts:311`), the token is minted with those claims
(`logic-function-executor.service.ts:364`), the strategy builds a user auth context
(`jwt.auth.strategy.ts:359`), and the role set becomes `[caller role, app role]`
(`resolve-role-ids-from-auth-context.util.ts`). Those roles combine with AND
(`compute-permission-intersection.util.ts:72`), so the partner's `canUpdateObjectRecords:
false` still wins and the create is denied. Phase 1c below is corrected for this.

## Baseline

Measured in the `wt-clean-process-in-partners` workspace and in production.

| Fact | Value |
|---|---|
| `Application.pitch` filled in production | 0 of 28 |
| Partner role, Application object permission | `canRead: true`, `canUpdate: true` |
| Partner role, Application locked fields | `name`, `partner`, `partnerUser`, `state` |
| Partner role, Application writable fields | `pitch`, `opportunity` |
| Front components already in the app | 2 (`my-profile`, `my-case-studies`) |
| Command menu items already in the app | 0 |

## What already exists and is reused

Do not rebuild these.

- `src/modules/shared/front-components/call-app-route.ts` — POSTs to `/s/<path>` with the
  app token.
- `resolve-partner-from-request.service.ts` — `resolvePartnerFromRequest(event)` reads
  `event.userWorkspaceId`, decodes the freshly minted `TWENTY_APP_ACCESS_TOKEN`, checks the
  two agree, then resolves member to partner. Usable only on an auth-required route, and it
  leaves the function bound by the caller's own role. The apply route needs
  `resolvePartnerFromForwardedToken` instead (Phase 1c).
- `find-duplicate-application.ts` — the duplicate query `resolve-candidacy` uses.
- `buildAppClient()` — the app-privileged client, with the vitest fallback.

## Decisions taken

| Question | Answer |
|---|---|
| What is a "dumb application" | A structurally bare record, made by hand |
| Can a partner edit the pitch after submit | No. Write-once |
| Where does the action live | Command menu item on an Opportunity record |

Write-once follows from the permission change. `canUpdateObjectRecords` is both the insert
check and the update check, so Application becomes read-only for partners. An edit path is
additive later: a second route and a button. No migration.

## Universal identifiers

Fresh. Do not reuse an existing id.

| Primitive | Identifier |
|---|---|
| Front component | `54f96b09-3c98-4d3c-815a-3f95a2e42527` |
| Logic function | `38fb146a-abe0-495f-8e20-1ebe99a9926a` |
| Command menu item | `e4668652-9212-4794-ab07-3514c1d0d829` |

---

## Phase 1 — The route

New folder `src/modules/application/apply/`.

### 1a. Constants

`constants/apply-to-brief.constants.ts` — plain data, no SDK import, so the front component
and the logic function both consume it.

- The three identifiers above.
- `MIN_PITCH_LENGTH`. Start at 100 characters.

### 1b. Service

`services/apply-to-brief.service.ts` — all the logic. No SDK or transport coupling.

Refuse on any of these, in this order:

1. `resolvePartnerFromRequest` returns an error. Reason `UNAUTHENTICATED` or `NO_PARTNER`.
2. The brief does not exist, or `isListed` is not `true`. Reason `BRIEF_NOT_OPEN`. This
   stops an application to a closed brief or a private one.
3. The trimmed pitch is shorter than `MIN_PITCH_LENGTH`. Reason `PITCH_TOO_SHORT`.
4. `findDuplicateApplication` finds a row for this partner and this brief. Reason
   `ALREADY_APPLIED`.

Then create the Application with `buildAppClient()` and set five fields:

| Field | Value |
|---|---|
| `opportunityId` | the brief |
| `partnerId` | from `resolvePartnerFromRequest` |
| `partnerUserId` | from `resolvePartnerFromRequest` |
| `pitch` | the trimmed pitch |
| `name` | `<partner> · <opportunity>` |

`state` defaults to `APPLIED`. Do not set it.

Warning: the route must set `name` itself. `on-application-set-name` triggers on
`application.updated` only, so an insert that already carries `partnerId` never fires it.
Extract the label into `src/modules/application/utils/build-application-name.ts` and call it
from both places. Two copies of that string will drift.

`resolveCandidacy` sees `partnerId` and `partnerUserId` both set and returns `{}` at its
first branch. Nothing else runs.

### 1c. Logic function

`apply-to-brief.logic-function.ts` — a thin entrypoint, under about 40 lines.

- `httpRouteTriggerSettings`: path `/apply-to-brief`, method `POST`, `isAuthRequired:
  false`, `forwardedRequestHeaders: ['authorization']`.
- `isAuthRequired: false` is what keeps the function on the app role. The caller is
  identified instead from the forwarded `authorization` header, which the function verifies
  by using it: one `currentUser { id }` query on `/metadata`. The server checks the
  signature, so the returned id is trustworthy. A decoded claim is not.
- This needs a second identity helper, `resolvePartnerFromForwardedToken`. The existing
  `resolvePartnerFromRequest` stays for the six self-service routes, which act AS the
  partner and are correctly bound by the partner's own role.

### 1d. GraphQL

`graphql/mutations/create-application.ts`, and reuse the existing duplicate query.

---

## Phase 2 — The front component

`front-components/apply-to-brief.front-component.tsx`.

- Read the brief id from `selectedRecordIds[0]`. Fall back to `recordId` only if the
  renderer supplies it. `recordId` is deprecated.
- One textarea for the pitch. A live character count against `MIN_PITCH_LENGTH`.
- Label it with the rule: Twenty introduces up to 2 partners per brief, so an application
  is not a guarantee.
- Disable submit below the minimum. The server check stays. The client check is a courtesy.
- On success: `enqueueSnackbar`, then `closeSidePanel`.
- On a refusal: show the reason. Map each reason to one plain sentence.

Follow `my-profile.front-component.tsx` for structure and for the `callAppRoute` call.

## Phase 3 — The command menu item

`command-menu-items/apply-to-brief.command-menu-item.ts`.

```ts
availabilityType: 'RECORD_SELECTION',
availabilityObjectUniversalIdentifier:
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
frontComponentUniversalIdentifier: APPLY_TO_BRIEF_FRONT_COMPONENT_ID,
```

Label it "Apply to this brief". Short label "Apply".

The item shows on every Opportunity, for every role, including yours. A partner sees only
listed briefs and their own, because of the row-level predicate. An admin who presses it
gets `NO_PARTNER`, because the caller does not resolve to a partner.

---

## Phase 4 — Close the hole

`src/roles/partner.role.ts`: set `canUpdateObjectRecords: false` on the Application object
permission. Keep `canReadObjectRecords: true`.

Do this last. Until Phase 1 to 3 are live, it removes the only way a partner can apply.

The four field locks (`name`, `partner`, `partnerUser`, `state`) become moot for partners,
but leave them. `configure-partner-rls.ts` asserts on them and exits non-zero on drift, and
the locks still describe intent.

## Phase 5 — Documentation

- `src/scripts/configure-partner-rls.ts` — `APPLY_WORKFLOW_WARNING` names a workflow that no
  longer exists. Replace it with one line: the apply path ships in the manifest, and no
  workspace step is needed.
- `src/workflows/README.md` — delete section 1. Two workflows remain: Mark as Winner, Daily
  Digest. Correct the count in the opening paragraph and in the checklist table.
- `resolve-candidacy.service.ts` — the header comment describes the workflow. It now
  describes the route.

## Phase 6 — Tests

Unit tests for the service, with a mocked client, in `__tests__/apply-to-brief.test.ts`.

| Case | Expected |
|---|---|
| Caller is not a partner | `NO_PARTNER`, no record created |
| Brief is not listed | `BRIEF_NOT_OPEN`, no record created |
| Pitch below the minimum | `PITCH_TOO_SHORT`, no record created |
| Partner already applied | `ALREADY_APPLIED`, no record created |
| Valid apply | one record, with the five fields above |

Each refusal test must assert that the create mutation did not run. A test that only checks
the returned reason passes even if the record is written.

Add a case to the name util test: the route path and the trigger path give the same string.

## Phase 7 — Deploy and check

1. Bump `package.json`.
2. `yarn twenty apply` on the target workspace.
3. `yarn rls:configure`.
4. Delete the "Apply to Brief" workflow in each workspace that has it.
5. Log in as a partner. Open a listed brief. Press Apply. Check the Application appears with
   a name, a pitch, and state `APPLIED`.
6. As the same partner, open the Applications table and confirm "New record" is gone.

---

## Accepted risks

- A partner can still write a lazy pitch that clears `MIN_PITCH_LENGTH`. Only your reading
  of the pitch stops that. The character count is a floor, not a quality gate.
- A partner cannot correct a typo in their own pitch. They ask you.
- The apply path now needs a deploy to change its copy. The workflow needed a click.
- `MIN_PITCH_LENGTH` is untested against real partners. No production Application has ever
  carried a pitch.
- The command menu item appears for every role on every Opportunity. Non-partners get a
  refusal, not a hidden button. `conditionalAvailabilityExpression` could hide it later.

## Deferred

| Item | Build it when |
|---|---|
| An edit route for the pitch | a partner asks to correct one |
| Hide the menu item from non-partners | the refusal message confuses your own team |
| Pitch quality checks beyond length | you have read ten real pitches and can name the pattern |
| Hoist COLORS/FONT into modules/shared | a third front component needs the same tokens |
