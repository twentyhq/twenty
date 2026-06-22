# Timeline Activities — Refactor Plan (Layers A & B)

> Status: proposal / RFC. Cross-cutting (twenty-server + twenty-front).
> Scope: **A) Activity Kind Registry** (kill the stringly-typed protocol, make rendering & production extensible) and **B) Timeline Projection** (a record's feed inherits activities from related records). Layer C (user-defined aggregation rules) is intentionally out of scope but every seam below is designed to be the place it plugs in.

## 0. Why

Today there are **two unrelated "activity" systems**:

- **System A — the `timelineActivity` object** (the unified "Timeline" feed). Populated by audit fan-out + bespoke note/task/email/calendar code. Read with a **flat** filter `target{Object}Id == recordId` — no traversal.
- **System B — the "Emails" / "Calendar" tabs.** Separate resolvers (`getTimelineThreadsFromObjectRecord`, `getTimelineCalendarEventsFromObjectRecord`) that **do** aggregate up the relation graph via `RelatedPersonIdsService` (BFS, max depth 3, person-ward only).

The contract inside System A is a magic string `name` (`"company.updated"`, `"linked-note.created"`, `"message.linked"`) decoded by `String.split('.')` in at least four frontend places and produced by hardcoded branches in one service + two listeners. It is not extensible and it already harbors a latent bug.

### Concrete brittleness inventory (the things this plan deletes)

Backend producers:
- `timeline-activity.service.ts` — `if (objectSingularName === 'note' | 'task' | 'noteTarget' | 'taskTarget')` ladder; emits `linked-{type}.{action}` by walking the `noteTarget`/`taskTarget` junction to find the "other" FK column.
- `message-participant.listener.ts` / `calendar-event-participant.listener.ts` — react to `*_matched` custom events, write rows **onto `person` only** (`recordId = participant.personId`), never company/opportunity.
- **Bug:** `calendar-event-participant.listener.ts:64` emits `name: 'message.linked'` for *calendar* events (copy-paste). It only renders correctly because the frontend routes on `linkedObjectMetadataId → nameSingular`, not on `name`. Perfect illustration of the fragile string contract.

Frontend consumers of the magic string:
1. `EventRowDynamicComponent.tsx` — `switch (linkedObjectMetadataItem?.nameSingular)` → calendarEvent / message / task / note / default.
2. `EventIconDynamicComponent.tsx` — `event.name.split('.')[1]` → created/updated/deleted/restored → icon, else object icon.
3. `filterOutInvalidTimelineActivities.ts` — `name.split('.')`, `name.startsWith('linked-')`, then diff readable-field validation.
4. `useTimelineActivities.ts:100` — `name.match(/note|task/i)` to decide which `linkedRecordId`s to prefetch titles for.

Two more correctness smells, fixed along the way:
- **`happensAt` is ignored on read.** The entity has `happensAt` (semantic event time) but the feed sorts (`useFindManyRecords` orderBy) and groups (`groupEventsByMonth`) and renders (`EventRow`) by `createdAt` (row insertion time). Wrong for imported/backfilled emails and essential for a correctly ordered *merged* feed.
- **An unknown linked object type** (e.g. a custom object linked in future) falls into `default` = `EventRowMainObject`, which is the wrong renderer.

---

# Layer A — Activity Kind Registry

**Goal:** one source of truth for "what kinds of timeline activity exist and how each is produced & rendered." Replace `name` string-parsing with an explicit, registry-backed **kind**.

## A.1 The `kind` concept

A timeline activity's discriminator today is implicitly `(linkedObjectMetadataId?, actionFromName)`. Collapse it into one explicit value resolved in exactly **one** place.

Initial taxonomy (string-literal union, per the project's "string literals over enums" rule):

```
// record-change family (anchored to the record itself, no linked record)
'record.created' | 'record.updated' | 'record.deleted' | 'record.restored'

// linked-record family (activity references another record)
'note.linked' | 'task.linked' | 'message.linked' | 'calendarEvent.linked'
// + a generic fallback for any other linked object type
'record.linked' (generic)
```

`name` is **kept** as a denormalized human/debug/search label (it already backs `SEARCH_FIELDS_FOR_TIMELINE_ACTIVITY`), but it stops being the routing contract.

## A.2 Staging — ship as a no-migration refactor first, persist `kind` second

**Phase A1 (no schema change).** Add a single resolver that owns *all* legacy decoding:

```ts
// twenty-front: the ONLY place allowed to read `event.name` / linkedObjectMetadata for routing
resolveTimelineActivityKind(event, linkedObjectMetadataItem): {
  family: 'recordChange' | 'linked';
  action?: 'created' | 'updated' | 'deleted' | 'restored';   // recordChange
  linkedObjectNameSingular?: string;                          // linked
}
```

Everything else keys off the result. This removes hotspots #1–#4 immediately, with zero data change.

**Phase A2 (persist `kind`).** Add a non-editable `kind` TEXT field to `TimelineActivityWorkspaceEntity` + standard-object metadata constant, generate an instance command (`database:migrate:generate --name addTimelineActivityKind --type slow`) that backfills existing rows from `name` using the same legacy decoder, and have producers set `kind` explicitly. `resolveTimelineActivityKind` then becomes `event.kind ?? legacyDecode(event)` — a pure back-compat shim. Dedup matching in `timeline-activity.repository.ts` switches from `name ===` to `kind === (+ linkedRecordId + target + member)`.

> A1 delivers the cleanliness win on its own; A2 is the durable end-state and the prerequisite for Layer C kinds that don't correspond to an object. A1 is mergeable without A2.

## A.3 Frontend registry (idiomatic — static `Partial<Record<…>>`, mirrors `FIELD_WIDGET_CONFIG` / `COLUMNS_BY_TABLE`)

No runtime `register()` — the codebase uses static central maps (confirmed against `FIELD_WIDGET_CONFIG`, `COLUMNS_BY_TABLE` with `renderCell`, `DISPLAY_MODE_ICONS`).

```ts
type TimelineActivityPresenter = {
  RowComponent: ComponentType<EventRowDynamicComponentProps>;
  // icon: either a static icon (record-change actions) or "use the linked object's icon"
  resolveIcon: (ctx) => ReactNode;
  // replaces filterOutInvalidTimelineActivities branching: which object's
  // readableFields validate this activity's diff (undefined = no diff validation)
  diffValidationObjectNameSingular?: (ctx) => string | undefined;
  // replaces the name.match(/note|task/i) prefetch hack
  needsLinkedRecordTitle?: boolean;
};

// linked family, keyed by linked object nameSingular, with a generic fallback
const LINKED_ACTIVITY_PRESENTERS: Partial<Record<string, TimelineActivityPresenter>> = {
  message:       { RowComponent: EventRowMessage,       resolveIcon: objectIcon, ... },
  calendarEvent: { RowComponent: EventRowCalendarEvent, resolveIcon: objectIcon, ... },
  note:          { RowComponent: EventRowActivity(Note), needsLinkedRecordTitle: true, ... },
  task:          { RowComponent: EventRowActivity(Task), needsLinkedRecordTitle: true, ... },
};
const GENERIC_LINKED_PRESENTER: TimelineActivityPresenter = { /* "{author} linked a {object}" */ };
const RECORD_CHANGE_PRESENTER:  TimelineActivityPresenter = { RowComponent: EventRowMainObject, ... };
const RECORD_CHANGE_ICONS: Record<RecordChangeAction, IconComponent> = {
  created: IconCirclePlus, updated: IconEditCircle, deleted: IconTrash, restored: IconRestore,
};
```

Lookup (replaces the switch + the icon if-chain):

```ts
const kind = resolveTimelineActivityKind(event, linkedObjectMetadataItem);
const presenter = kind.family === 'linked'
  ? (LINKED_ACTIVITY_PRESENTERS[kind.linkedObjectNameSingular!] ?? GENERIC_LINKED_PRESENTER)
  : RECORD_CHANGE_PRESENTER;
```

**Bonus extensibility win:** unknown linked object types now hit `GENERIC_LINKED_PRESENTER` (a real "linked a {object}" row) instead of the wrong `EventRowMainObject`.

### Frontend files touched (A1)
- New: `rows/registry/timelineActivityPresenters.ts`, `utils/resolveTimelineActivityKind.ts`, `types/TimelineActivityKind.ts`.
- Rewrite to thin lookups: `EventRowDynamicComponent.tsx`, `EventIconDynamicComponent.tsx`.
- `filterOutInvalidTimelineActivities.ts` → drive readable-field validation off `presenter.diffValidationObjectNameSingular` instead of `name.split`.
- `useTimelineActivities.ts` → replace `name.match(/note|task/i)` with `presenter.needsLinkedRecordTitle`.
- `EventRow.tsx` → use `event.happensAt ?? event.createdAt` for display (see happensAt fix).
- `groupEventsByMonth.ts` → group/sort by `happensAt`.

## A.4 Backend producer registry (parallel cleanup; the Layer C seam)

Extract the if-ladder + the two listeners into named **producers** behind a tiny dispatcher. Do **not** build a plugin system here (that's C) — just make each built-in a unit implementing a shared interface, set `kind` explicitly, and **fix the calendar bug**.

```ts
type TimelineActivityProducer = {
  appliesTo(objectSingularName: string, action: DatabaseEventAction): boolean;
  produce(batch): Promise<TimelineActivityPayload[]>; // payloads carry explicit `kind`
};
```

Built-ins: `RecordChangeProducer` (default, all audit-logged objects → `record.<action>`), `NoteLinkProducer` / `TaskLinkProducer` (extract the junction-walk → `note.linked` / `task.linked` onto the linked targets), `MessageLinkProducer` / `CalendarEventLinkProducer` (the two listeners, now emitting the correct `message.linked` / `calendarEvent.linked`).

### Backend files touched
- `timeline-activity.service.ts` → dispatcher over producers; ladder removed.
- New `producers/*.producer.ts`.
- `message-participant.listener.ts` / `calendar-event-participant.listener.ts` → thin adapters over the producers; **`calendarEvent.linked` fix lands here**.
- (A2) `timeline-activity.workspace-entity.ts`, standard-object metadata constant, instance command, `timeline-activity.repository.ts` dedup key.

## A.5 Tests
- Unit: `resolveTimelineActivityKind` over every legacy `name` shape incl. the buggy `message.linked`-for-calendar row → must resolve to `calendarEvent`.
- Unit: presenter lookup returns `GENERIC_LINKED_PRESENTER` for an unknown linked type (no throw).
- Snapshot/story parity for each existing row type (stories already exist, e.g. `EventCardMessage.stories.tsx`).
- Backend: each producer emits identical payloads to today (golden tests) except the calendar `kind` fix.

---

# Layer B — Timeline Projection ("inheritance")

**Goal:** a record's feed includes activities from **related** records along configured relation paths (person→company, person→opportunity, …), generalizing the email/calendar traversal to the whole unified feed — with defaults that keep it useful, not noisy. This is also what finally lets email/calendar appear on company/opportunity timelines *without changing producers*.

## B.1 Anchoring model (no producer change required)

Keep every activity anchored to its **direct subject** record(s) — already represented by `target{Object}Id`. Projection is purely additive at read time:

```
feed(R) = own(R)  ∪  ⋃ { projectable(A) : A anchored to R', R' ∈ relatedRecords(R, path) }
```

Because email/calendar rows are anchored to `person` today, projecting `person → company` / `person → opportunity` surfaces them on those feeds **for free**. No change to listeners/producers.

## B.2 The key simplifier: it's ONE table → ONE query

Email/calendar resolvers do an awkward dance because they merge across *different* entities. Timeline activities all live in **one** table, so the entire merged + paginated feed is a single query with a computed `WHERE`:

```sql
WHERE
     "targetCompanyId" = :recordId                                   -- own
  OR ("targetPersonId" = ANY(:relatedPersonIds)      AND kind = ANY(:projectableKinds))  -- projected
  OR ("targetOpportunityId" = ANY(:relatedOpportunityIds) AND kind = ANY(:projectableKinds))
ORDER BY "happensAt" DESC
OFFSET :offset LIMIT :pageSize
```

Correct global pagination, correct chronology (`happensAt`), no N-way merge. The only thing computed beforehand is the related-id sets — which reuse the **exact** traversal email/calendar already use.

## B.3 Reuse & generalize the existing traversal

- `walkRelationPath` (in `RelatedPersonIdsService`) is **already generic** over object/joinColumn/direction. Only `findRelationPathsToPerson` hardcodes the `person` target.
- Promote it: `findRelationPaths({ rootObjectNameSingular, targetObjectNameSingular, maxDepth, flatMaps })`. `findRelationPathsToPerson` becomes `findRelationPaths(..., target: 'person')`.
- Add `RelatedRecordIdsService.getRelatedRecordIds({ objectNameSingular, recordId, targetObjectNameSingular, maxDepth })` reusing `walkRelationPath`. Keep `RelatedPersonIdsService` as a thin delegate so **email/calendar are untouched**.
- For projection onto a company, "who projects onto me" for source type `person` is exactly `getRelatedRecordIds(company, id, 'person')` — i.e. the same person-ward paths email/calendar already compute.

## B.4 Projection policy (avoid the noise trap — and the Layer C seam)

Projection must be selective. A static default policy for B; later user-editable (Layer C).

```ts
type ProjectionRule = {
  sourceObjectNameSingular: string;   // 'person'
  targetObjectNameSingular: string;   // 'company' | 'opportunity'
  kinds: TimelineActivityKind[];      // which kinds bubble up
  maxDepth?: number;                  // per-rule cap
};
```

Default rules:
- `person → company`: `note.linked, task.linked, message.linked, calendarEvent.linked` (depth 1).
- `person → opportunity`: same set (via the path person↔opportunity, depth ≤ 2).
- **Record-change kinds do NOT project** (a company must not show every field-edit of every contact).

## B.5 New resolver

`getTimelineActivitiesFromObjectRecord(objectNameSingular, recordId, page, pageSize)` returning `TimelineActivitiesWithTotalDTO`, mirroring `getTimelineThreadsFromObjectRecord`:
1. For each `ProjectionRule` whose target == `objectNameSingular`: `relatedIds[source] = getRelatedRecordIds(...)` (traversal, system context — yields IDs only).
2. Build the OR-filter (B.2) with per-source `projectableKinds`.
3. One query, `ORDER BY happensAt DESC`, offset/limit, plus a `COUNT`.
4. Apply permission filtering (B.6).
5. Map to the same `TimelineActivity` shape the frontend already consumes.

## B.6 Permissions — the load-bearing part

The resolver runs in **system context** (consistent with email/calendar, because the generic-ORM per-record permission pipeline isn't reusable inside a custom resolver). Therefore Layer B must enforce permissions **explicitly** — it is not free here the way it is for today's `useFindManyRecords` path. Three concerns:

1. **Record read access to anchors.** The traversal-to-IDs may bypass (IDs aren't content), but the final activity set must be filtered to records the requesting user may read. Concretely: resolve the user's object-permissions and any record-level restrictions, and exclude activities whose anchor (or projected source) the user can't see. (Verify whether `timelineActivity` carries record-level restrictions; if not, filter by the user's access to the *target* record type.)
2. **Linked-record cached-name leakage (the new risk).** `note.linked` / `task.linked` rows store `linkedRecordCachedName` *on the activity*. Projecting a private note up to a company would leak its title even though opening it is gated. **Mitigation (must-build in B2):** when projecting linked kinds, batch-check the user's read access to `linkedRecordId` and drop/blank rows accordingly. This is the single most important correctness item in Layer B.
3. **Email/calendar content masking is already safe.** Those rows store only `linkedRecordId`; `EventCardMessage` / `EventCardCalendarEvent` fetch the body via `useFindOneRecord`, which already applies channel-visibility masking (`FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED`). Projection reveals only "an email exists," matching today's person-level behavior. No new leak, but call it out so existence-sensitivity is a conscious decision.

## B.7 `happensAt` correctness (prerequisite for a correct merged feed)

- Producers set `happensAt` to the true event time: record-change = event time; `message.linked` = message `receivedAt`/`sentAt`; `calendarEvent.linked` = `startsAt`. (Today `happensAt` defaults to `now()`.)
- Resolver orders by `happensAt`; frontend groups/displays by `happensAt`.
- Backfill `happensAt` for existing rows from the best available source in the A2/B instance command.

## B.8 Frontend changes
- `useTimelineActivities` → call the generated `useGetTimelineActivitiesFromObjectRecord` query instead of `useFindManyRecords`; keep returning `TimelineActivity[]` so `EventList`/`EventRow` are unchanged.
- Pagination → page/pageSize (copy `EmailsCard`'s pattern) instead of cursor `fetchMoreRecords`.
- Real-time → refetch on relevant SSE/browser events (the per-record flat-filter `useListenToEventsForQuery` wiring is replaced by a query-level refetch).
- `hasTimelineActivityField` gate stays (a record type still needs a morph target to anchor its own activities), but projected feeds now light up company/opportunity timelines that were previously sparse.

## B.9 Convergence (stretch, after parity)
Once the unified feed reaches parity, the standalone **Emails** / **Calendar** tabs can become *filtered views* of the unified feed (`kinds = [message.linked]` / `[calendarEvent.linked]`) rather than separate resolvers — collapsing System A and System B into one. Decide later; not required for B.

---

# Sequencing

| Phase | Content | Migration? | Flag |
|------|---------|-----------|------|
| **A1** | Frontend `resolveTimelineActivityKind` + presenter registry; delete 4 string-parsing hotspots; backend producer extraction + **calendar bug fix** | none | — |
| **A2** | Persist `kind` on entity + backfill; producers set it; dedup keyed on `kind` | slow instance command | — |
| **B0** | Generalize `findRelationPaths`; add `RelatedRecordIdsService` (delegate person-ward); no behavior change | none | — |
| **B1** | New `getTimelineActivitiesFromObjectRecord` returning own-only via single-query + `happensAt` ordering; switch frontend to it | `happensAt` backfill | `IS_TIMELINE_PROJECTION_ENABLED` |
| **B2** | Projection: OR-filter over related-ids + default policy + **permission safeguards (B.6)** | none | same flag |
| **B3** | (stretch) Emails/Calendar tabs as filtered views of unified feed | none | flag |

Everything behind `FeatureFlagService` (the timeline module already imports it).

# Risks / open decisions (need your call)

1. **Computed (recommended) vs materialized projection.** Computed = always consistent when a contact changes company, single enforcement point, unifies with email/calendar; cost is read-time work. Materialized (fan-out rows like today's note/task linking) keeps reads trivial but creates a **reprojection-on-relation-change** correctness landmine + write amplification. Plan assumes **computed**.
2. **Default projection policy** — confirm the kind set and depths in B.4 (especially how far person→opportunity should reach).
3. **Permission safeguard for projected `linkedRecordCachedName`** (B.6.2) — confirm we drop vs blank projected linked rows the user can't read.
4. **Existence-sensitivity** of projected email/calendar rows on company/opportunity (B.6.3) — acceptable, matching today's person behavior?
5. **Scale** — very large companies (thousands of contacts) make `relatedPersonIds` huge; the `= ANY(:ids)` filter and an index on `(happensAt, target*Id)` need validation. Same ceiling email/calendar already hit; may push the related-id filter into a join for big sets.
