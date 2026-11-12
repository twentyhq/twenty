# Record Change History

Add the History using the existing API call to backend

## Summary

Twenty already captures record changes in the `timelineActivity` object and shows them in the record **Timeline** tab.
We did not build a parallel system. We traced the existing flow, confirmed it in the database, the API and the UI, and closed the gaps we found.

| Change | Why |
| --- | --- |
| History rows are read only for users and API keys | Any logged in user could rewrite history through the API |
| The Timeline type filter is sent to the server | The filter ran in the browser, which made "updated" look empty until more pages loaded |

## Path roots

Paths in the tables below are relative to these roots.

| Root | Full path |
| --- | --- |
| `server/` | `packages/twenty-server/src/` |
| `timeline/` | `packages/twenty-server/src/modules/timeline/` |
| `front/` | `packages/twenty-front/src/modules/` |
| `timeline-ui/` | `packages/twenty-front/src/modules/activities/timeline-activities/` |

## What already existed (verified)

| Requirement | Where it lives |
| --- | --- |
| Field name, before, after | `server/engine/core-modules/event-emitter/utils/object-record-changed-values.ts:116` builds `{ before, after }` per field |
| Time of change and author | `timeline/repositories/timeline-activity.repository.ts:431` stores `happensAt`, `properties.diff`, `workspaceMemberId` |
| Async write | `entity-events-to-db.listener.ts:57` queues a job, the worker runs `timeline/jobs/upsert-timeline-activity-from-internal-event.job.ts:18` |
| Backend API | Generated GraphQL `timelineActivities` and REST `/rest/timelineActivities` |
| UI, newest first | `timeline-ui/hooks/useTimelineActivities.ts` with `orderBy: happensAt DescNullsFirst` |
| Filter by activity type | `front/page-layout/widgets/timeline/components/WidgetActionTimelineFilter.tsx` (funnel icon, select "updated") |

### Update flow

```
UI edit -> GraphQL updatePerson
  -> update-one-resolver.factory.ts:31 -> common-update-one-query-runner.service.ts:39
  -> workspace-repository.ts:616 update() -> emits event with diff (:1286)
  -> entity-events-to-db.listener.ts:57 -> Redis queue (BullMQ)
  -> worker: timeline-activity.service.ts:114 -> INSERT timelineActivity
  -> UI: useTimelineActivities -> Timeline tab
```

## Design decisions

1. **Reuse the existing API instead of a new history endpoint.**
   A new endpoint would not close the generic `timelineActivities` endpoint. That endpoint already requires login and already strips restricted fields. A new one would only add code.

2. **Block edit access only, for `user` and `apiKey`.**
   - Users and API keys can no longer update history rows (GraphQL and REST).
   - Apps (`application` auth) keep their existing sanitized path.
   - The worker writes through the repository, not the API hooks, and is not affected.
   - Delete is still allowed. This was a conscious choice to keep the change small (see "Left").

3. **Filter history on the server, keep the browser filter.**
   The server filter makes the "updated" view correct and paged. The existing browser filter stays as a guard for inactive or deleted activity types.

4. **No change for the no-op row.**
   `filterOutInvalidTimelineActivities.ts:78-82` already drops update rows with no readable diff. The bare row in `EventRowMainObjectUpdated.tsx:42` is never reached through the Timeline list.

## Files changed

### Feature

| File | Change |
| --- | --- |
| `timeline/query-hooks/utils/timeline-activity-mutation-input.util.ts` | New guard `assertTimelineActivityIsNotMutatedByUserOrApiKey`. Throws `PermissionsException` (`PERMISSION_DENIED`) for `user` and `apiKey`, the same error class the blocklist module uses |
| `timeline/query-hooks/timeline-activity-update-one.pre-query-hook.ts` | Calls the guard first |
| `timeline/query-hooks/timeline-activity-update-many.pre-query-hook.ts` | Calls the guard first |
| `timeline-ui/hooks/useTimelineActivities.ts` | Adds `timelineActivityTypeId: { in: [...] }` to the API filter when types are selected. The ids are joined into a string key so the filter memo stays stable across renders |

### Windows local setup only (not part of the feature)

Twenty supports Windows only through WSL. These fixes were needed to run the stack natively. They can be dropped from review.

| File | Change |
| --- | --- |
| `packages/twenty-shared/vite.bundled-source-plugin.ts` | Accept absolute `C:/` entry paths |
| `server/constants/assets-path.ts` | Use `path.sep` instead of `/dist/` |
| `server/engine/workspace-manager/dev-seeder/data/services/dev-seeder-data.service.ts` | Same `path.sep` fix for seed sample files |

## Edge cases

| Edge case | Handled by | Status |
| --- | --- | --- |
| Unauthenticated user reads history | Workspace API auth | Returns `UNAUTHENTICATED` |
| Restricted fields | Server: `timeline/query-hooks/apply-timeline-activities-visibility-restrictions.service.ts:35`. UI: `timeline-ui/utils/filterOutInvalidTimelineActivities.ts:81` keeps only readable fields | Hidden at two levels |
| No-op update | Server skips unchanged fields (`object-record-changed-values.ts:112`) and empty diffs (`timeline/services/timeline-activity.service.ts:284`). UI drops rows with no readable diff | No misleading row |
| User or API key rewrites history | New guard in the update hooks | Returns `FORBIDDEN` / HTTP 403 |
| Concurrent updates | Each update emits its own event with its own before and after | One row per update |
| Failed writes | The history row is written by the worker after the record write. A failed record write emits no event | No orphan history |

## Verification

### API (curl, logged in as `tim@apple.dev`)

| Test | Result |
| --- | --- |
| `updateTimelineActivity` | `FORBIDDEN`, `PERMISSION_DENIED` |
| `updateTimelineActivities` | `FORBIDDEN`, `PERMISSION_DENIED` |
| `PATCH /rest/timelineActivities/:id` | HTTP 403 |
| Read the same row after the attempts | Unchanged |
| Query without a token | `UNAUTHENTICATED` |
| History of one person, no type filter | `totalCount: 604` (mostly linked emails and notes) |
| Same person, type filter `recordUpdated` | `totalCount: 1`, the real field change |

### Tests (existing suites for the touched areas)

| Command | Result |
| --- | --- |
| `npx jest packages/twenty-server/src/modules/timeline --config=packages/twenty-server/jest.config.mjs` | 15 of 15 suites, 93 of 93 tests passed |
| `npx jest packages/twenty-front/src/modules/activities/timeline-activities packages/twenty-front/src/modules/page-layout/widgets/timeline --config=packages/twenty-front/jest.config.mjs` | 16 of 16 suites, 65 of 65 tests passed |

Note: `useTimelineActivities.test.tsx` now logs a `No more mocked responses for FindManyTimelineActivityTypes` warning. The hook now reads the type filter, which loads activity types through Apollo, and the test does not mock that query. The test still passes.

No new tests were added in this pass. The full package suites were not run.

### UI demo

1. Sign in as `tim@apple.dev` / `tim@apple.dev`.
2. Open a person, edit a field (for example Company or Job Title).
3. Open the **Timeline** tab, click the funnel icon, select only **updated**.
4. The change appears at the top with before, after and time.

## Left for production

- Block delete and destroy of history rows (`deleteOne`, `deleteMany`, `destroyOne`, `destroyMany` hooks).
- Add focused tests: guard per auth type, update hooks, the server type filter in `useTimelineActivities`. Mock `FindManyTimelineActivityTypes` in the hook test.
- Hide `updatedBy` from the diff. It is saved on every edit and can show "2 fields" when one field changed.
- A one click "Field changes only" option in the Timeline filter.
- Block users from creating fake history rows of system types through `createTimelineActivity`.
- Run the full `twenty-server` and `twenty-front` suites in CI.

## Local run notes (Windows)

```bash
export PATH="/c/nvm4w/nodejs:$PATH"
export COMSPEC='C:\PROGRA~1\Git\usr\bin\bash.exe'   # Nx runs bash syntax
docker compose -f packages/twenty-docker/docker-compose.dev.yml up -d
npx nx database:reset twenty-server --configuration=seed
cd packages/twenty-server && NODE_ENV=development node dist/main            # server :3000
cd packages/twenty-server && NODE_ENV=development node dist/queue-worker/queue-worker
npx nx start twenty-front --excludeTaskDependencies                         # front :3001
```