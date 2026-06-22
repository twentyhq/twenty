# PR A — Timeline Activity Kind Registry (implementation plan)

> Companion to `TIMELINE_ACTIVITIES_REFACTOR.md`. This is the tactical, file-by-file plan for **Layer A only**. Layers B (projection) and C (user rules) are out of scope but every seam here is built to be where they plug in.

## Goal

Replace the implicit, stringly-typed activity protocol (the `name` field decoded by `String.split('.')` in four frontend places and produced by a hardcoded if-ladder + two listeners) with **one explicit, persisted `kind` contract**, consumed through registries on both ends.

After this PR:
- There is exactly **one** function that decodes a timeline activity into `{ kind, action }`, and exactly **one** registry that maps a kind to its renderer.
- Producers **declare** their kind instead of encoding it in a magic string.
- The `calendarEvent.linked`-mislabeled-as-`message.linked` bug is fixed at the source.
- Adding a new activity type = add a producer + register a presenter. No core switch edits.

### Non-goals (explicitly deferred)
- **Projection / inheritance** → PR B.
- **User-defined / app-defined kinds & producers** → Layer C (this PR uses the multi-provider array; C graduates it to `DiscoveryService` decorator discovery).
- **`happensAt`-vs-`createdAt` ordering fix** → PR B (it only matters once feeds are merged; keeping it out keeps PR A focused). Producers will still set `happensAt` correctly where trivial, but the read path is untouched here.
- **Persisting `action`** as its own column — `action` stays derived from `name` *inside the single resolver*, so all string-parsing collapses to one place without a second migration.

## The contract

### `TimelineActivityKind` — shared in `twenty-shared`

The kind is the **category / presenter discriminator** (the ambiguous, extensible axis). `action` is orthogonal and remains carried by `name`.

```ts
// packages/twenty-shared/src/timeline/timeline-activity-kind.ts  (new)
export type TimelineActivityKind =
  | 'recordChange'         // created/updated/deleted/restored of the anchor record
  | 'linkedNote'
  | 'linkedTask'
  | 'linkedMessage'
  | 'linkedCalendarEvent'
  | 'linkedRecord';        // generic fallback for any other linked object type

export type TimelineActivityAction =
  | 'created' | 'updated' | 'deleted' | 'restored' | 'linked';

export type TimelineActivityDescriptor = {
  kind: TimelineActivityKind;
  action: TimelineActivityAction;
};
```

### The single decoder (the only place that parses `name`)

```ts
// packages/twenty-shared/src/timeline/resolve-timeline-activity-descriptor.ts (new)
// Shared so backend (dedup/queries) and frontend (rendering) agree byte-for-byte.
export const resolveTimelineActivityDescriptor = (input: {
  kind?: string | null;                 // persisted kind (preferred)
  name: string | null;                  // legacy carrier of action (+ legacy kind)
  linkedObjectNameSingular?: string | null; // from linkedObjectMetadataId → nameSingular
}): TimelineActivityDescriptor => {
  const action = parseActionFromName(input.name); // the ONLY name.split('.')
  const kind = isTimelineActivityKind(input.kind)
    ? input.kind
    : legacyDecodeKind(input);          // back-compat for un-backfilled rows
  return { kind, action };
};
```

`legacyDecodeKind` reproduces today's behavior precisely (and is the back-compat shim during rollout): if `linkedObjectNameSingular` is `message`/`calendarEvent`/`note`/`task` → the matching `linked*` kind; any other linked object → `linkedRecord`; no linked object → `recordChange`. **This also fixes the calendar bug for historical rows**, because it keys off `linkedObjectMetadataId → nameSingular`, never the buggy `name`.

> Why shared, not frontend-only: the backend dedup and (future) projection filters key on `kind`. One implementation, imported by both packages, prevents drift.

---

## Backend changes

### 1. Persist the `kind` field on the standard object

Exact files (mechanism confirmed: field types live in the builder util, not decorators):

1. **`packages/twenty-shared/src/metadata/constants/standard-object.constant.ts`** — under `timelineActivity.fields` add:
   ```ts
   kind: { universalIdentifier: '<new-uuid-v4, fixed forever>' },
   ```
2. **`packages/twenty-server/src/modules/timeline/standard-objects/timeline-activity.workspace-entity.ts`** — add `kind: string | null;` to the class.
3. **`.../twenty-standard-application/utils/field-metadata/compute-timeline-activity-standard-flat-field-metadata.util.ts`** — add, mirroring `linkedRecordCachedName`:
   ```ts
   kind: createStandardFieldFlatMetadata({
     objectName, workspaceId,
     context: {
       fieldName: 'kind',
       type: FieldMetadataType.TEXT,
       label: i18nLabel(msg`Kind`),
       description: i18nLabel(msg`Activity kind`),
       icon: 'IconCategory',
       isSystem: true,        // internal discriminator, not user-facing
       isNullable: true,      // nullable so legacy rows + the back-compat shim stay valid
       isUIEditable: false,
     },
     standardObjectMetadataRelatedEntityIds, dependencyFlatEntityMaps,
     twentyStandardApplicationId, now,
   }),
   ```
   Skip the `allTimelineActivities` view-field util (system field, not shown in UI).
4. **Instance command (slow, with backfill)** — `npx nx run twenty-server:database:migrate:generate --name add-kind-to-timeline-activity --type slow`. Edit it to:
   - `up`: `ALTER TABLE … ADD COLUMN IF NOT EXISTS "kind" text` (per workspace schema).
   - `runDataMigration`: backfill `kind` from existing rows using the **same legacy decode logic** — i.e. join `linkedObjectMetadataId` → object `nameSingular` and apply the `linkedRecord*`/`recordChange` mapping in SQL (or batch in TS). Leave `kind` nullable (no `SET NOT NULL`) so the shim covers any row the backfill misses.
   - `down`: `DROP COLUMN IF EXISTS "kind"`.
5. `npx nx run twenty-front:graphql:generate --configuration=metadata` so the field is in the metadata GraphQL types.

### 2. Producer registry (replaces the if-ladder + the two listeners)

Use the **multi-provider array** pattern (idiomatic, mirrors `tool-provider.module.ts`).

```ts
// packages/twenty-server/src/modules/timeline/producers/timeline-activity-producer.interface.ts (new)
export type TimelineActivityProducer = {
  appliesTo(ctx: { objectSingularName: string; action: DatabaseEventAction }): boolean;
  produce(batch): Promise<TimelineActivityPayload[]>; // each payload carries an explicit `kind`
};
export const TIMELINE_ACTIVITY_PRODUCERS = Symbol('TIMELINE_ACTIVITY_PRODUCERS');
```

Built-in producers (each `@Injectable`, collected via `{ provide: TIMELINE_ACTIVITY_PRODUCERS, useFactory: (...p) => p, inject: [...] }`):

| Producer | `kind` it sets | Notes |
|---|---|---|
| `RecordChangeProducer` | `recordChange` | default for all audit-logged objects; `name = {object}.{action}` kept for action/display/search |
| `NoteLinkProducer` | `linkedNote` | extracts today's note/noteTarget junction-walk |
| `TaskLinkProducer` | `linkedTask` | extracts today's task/taskTarget junction-walk |
| `MessageLinkProducer` | `linkedMessage` | from `message-participant.listener.ts` |
| `CalendarEventLinkProducer` | `linkedCalendarEvent` | from `calendar-event-participant.listener.ts` — **fix `name: 'message.linked'` → `'calendarEvent.linked'`** |

- **`timeline-activity.service.ts`** → `transformEventsToTimelineActivityPayloads` becomes: `producers.filter(p => p.appliesTo(...)).flatMap(p => p.produce(...))`. The `note`/`task`/`noteTarget`/`taskTarget`/default ladder is deleted.
- **The two `*-participant.listener.ts`** keep their `@OnCustomBatchEvent('…_matched')` entrypoints but delegate to the new producers (or move the body into the producer and have the listener call it). Net behavior identical except the calendar `kind`/`name` fix.
- **`TimelineActivityPayload`** (`types/timeline-activity-payload.ts`) gains `kind: TimelineActivityKind`.

### 3. Dedup key

**`repositories/timeline-activity.repository.ts`** — the 10-minute merge currently matches on `timelineActivity.name === payload.name`. Switch the equality to `kind` (+ existing target/member/linkedRecordId predicates). `name` stays for display/search. Backfill ensures existing rows have `kind` before this matters.

---

## Frontend changes

1. **`types/TimelineActivity.ts`** — add `kind: string | null;` (the `& Record<string, any>` already tolerates it, but make it explicit/typed).
2. **New `utils/resolveTimelineActivityDescriptor` usage** — import the shared resolver; pass `linkedObjectNameSingular` from `useLinkedObjectObjectMetadataItem(event.linkedObjectMetadataId)`.
3. **New presenter registry** — `rows/registry/timelineActivityPresenters.ts`, static `Partial<Record<…>>` (idiom: `FIELD_WIDGET_CONFIG` / `COLUMNS_BY_TABLE`):
   ```ts
   type TimelineActivityPresenter = {
     RowComponent: ComponentType<EventRowDynamicComponentProps>;
     objectNameSingular?: CoreObjectNameSingular; // for EventRowActivity (note/task)
     needsLinkedRecordTitle?: boolean;            // replaces the name.match(/note|task/i) hack
     diffValidationSource?: 'mainObject' | 'linkedObject'; // replaces filter name-parsing
   };
   const TIMELINE_ACTIVITY_PRESENTERS: Record<TimelineActivityKind, TimelineActivityPresenter> = {
     recordChange:        { RowComponent: EventRowMainObject, diffValidationSource: 'mainObject' },
     linkedMessage:       { RowComponent: EventRowMessage },
     linkedCalendarEvent: { RowComponent: EventRowCalendarEvent },
     linkedNote:          { RowComponent: EventRowActivity, objectNameSingular: Note, needsLinkedRecordTitle: true, diffValidationSource: 'linkedObject' },
     linkedTask:          { RowComponent: EventRowActivity, objectNameSingular: Task, needsLinkedRecordTitle: true, diffValidationSource: 'linkedObject' },
     linkedRecord:        { RowComponent: EventRowGenericLinked /* new: "{author} linked a {object}" */ },
   };
   ```
4. **Rewrite the four hotspots to thin lookups:**
   - `EventRowDynamicComponent.tsx` → `const { RowComponent } = TIMELINE_ACTIVITY_PRESENTERS[kind]; return <RowComponent … />`. The `switch` is gone; unknown linked types now hit `linkedRecord` (a real generic row) instead of the wrong `EventRowMainObject`.
   - `EventIconDynamicComponent.tsx` → `RECORD_CHANGE_ICONS[action] ?? <ObjectMetadataIcon …>` using `action` from the resolver (no inline `split`).
   - `filterOutInvalidTimelineActivities.ts` → drive readable-field validation off `presenter.diffValidationSource` + `linkedObjectMetadataItem`, not `name.split`/`startsWith('linked-')`.
   - `useTimelineActivities.ts:100` → prefetch titles for activities whose presenter has `needsLinkedRecordTitle`, not `name.match(/note|task/i)`.
5. **`EventRowGenericLinked`** (new small component) — the fallback presenter; "{author} linked a {object} {cachedName}", opens the linked record in the side panel. Pure win: custom/linked objects render sanely today instead of falling through to the main-object renderer.

---

## Back-compat & rollout

- The shared resolver reads `kind ?? legacyDecode(name, linkedObjectNameSingular)`, so the **frontend works whether or not the migration has run** on a given workspace, and whether a row is old or new.
- Producers set `kind` going forward; the backfill sets it for history. The dedup key swap to `kind` is safe because both new writes and backfilled rows carry it (and the shim covers stragglers on read).
- No GraphQL breaking change — `kind` is additive; `name` is retained.

## Suggested commit breakdown (one reviewable PR)

1. `feat(shared): add TimelineActivityKind + resolveTimelineActivityDescriptor` (contract + legacy decoder + unit tests).
2. `feat(server): persist kind on timelineActivity` (constant + entity + builder + slow instance command w/ backfill + graphql regen).
3. `refactor(server): timeline activity producer registry + fix calendarEvent kind` (producers, service ladder removed, listeners delegate, payload+dedup on kind).
4. `refactor(front): timeline activity presenter registry` (registry, 4 hotspots, generic linked row, type).
5. `test:` golden producer tests + resolver tests + story parity.

> Natural split point if reviewers want it smaller: commits 1+4 (resolver + presenter registry, derive-only, **no migration**) land the entire frontend cleanliness win on their own; commits 2+3 (persist kind + producer registry) can follow. The doc's earlier A1/A2 staging maps onto exactly this seam.

## Tests

- **Shared:** `resolveTimelineActivityDescriptor` over every legacy `name` shape incl. the buggy calendar row (`name='message.linked'`, linkedObject=`calendarEvent`) → must yield `kind: 'linkedCalendarEvent'`. Unknown linked object → `linkedRecord`.
- **Server:** golden tests per producer asserting payloads byte-identical to today except the calendar `kind`/`name` fix; dedup test keyed on `kind`.
- **Front:** registry returns `linkedRecord` presenter for an unknown linked type (no throw); existing row stories (`EventCardMessage.stories.tsx`, `EventRowMainObjectUpdated.stories.tsx`, …) still pass.
- **Migration:** integration test that backfills a fixture set and asserts every row gets the expected `kind`.

## Risks

- **Backfill correctness** on large `timelineActivity` tables — slow command must batch and be idempotent (`WHERE kind IS NULL`). The nullable-forever choice means a missed row degrades gracefully to the shim, not to breakage.
- **`linkedRecord` generic row** must handle a linked object the user can't read (cached name could leak) — minor here since PR A doesn't change *which* rows a user sees (that's PR B's permission work); it only changes rendering of rows already visible today.
- **Two parsing implementations drifting** — mitigated by putting `resolveTimelineActivityDescriptor` in `twenty-shared` and importing it on both sides.

## File touch checklist

**twenty-shared:** `timeline/timeline-activity-kind.ts` (new), `timeline/resolve-timeline-activity-descriptor.ts` (new), `metadata/constants/standard-object.constant.ts`.
**twenty-server:** `timeline-activity.workspace-entity.ts`, `compute-timeline-activity-standard-flat-field-metadata.util.ts`, `types/timeline-activity-payload.ts`, `services/timeline-activity.service.ts`, `repositories/timeline-activity.repository.ts`, `producers/*` (new), `message-participant.listener.ts`, `calendar-event-participant.listener.ts`, new slow instance command.
**twenty-front:** `types/TimelineActivity.ts`, `rows/registry/timelineActivityPresenters.ts` (new), `rows/components/EventRowDynamicComponent.tsx`, `rows/components/EventIconDynamicComponent.tsx`, `rows/generic/EventRowGenericLinked.tsx` (new), `utils/filterOutInvalidTimelineActivities.ts`, `hooks/useTimelineActivities.ts`, generated metadata GraphQL types.
