# Timeline activities: audit and configurability proposal

Backend only. The goal is to describe exactly what is hardcoded today, define what
"a related object produces a timeline activity on its parent" actually means, and
propose a structure that makes it configurable per workspace with no end-user
behavior change in the first phases.

The proposal is a `timelineActivityRule` metadata entity built on the existing
**junction relation** concept, with default rules derived from metadata rather
than materialized as rows.

## 1. How it works today

### 1.1 Write path

```
mutation
  -> WorkspaceEventEmitter emits <objectNameSingular>.<action> batch
     -> EntityEventsToDbListener (entity-events-to-db.listener.ts)
        - skips objectMetadata.universalIdentifier === timelineActivity
        - gate: objectMetadata.isAuditLogged
          -> queue CreateEventLogFromInternalEvent  (ClickHouse / event sink)
          -> queue UpsertTimelineActivityFromInternalEvent
             -> gate: !isSystem || nameSingular in SYSTEM_OBJECTS_WITH_TIMELINE_ACTIVITIES
             -> resolves event.userId to workspaceMemberId
             -> TimelineActivityService.upsertEvents
                - strips POSITION fields from the diff
                - branches on objectSingularName: note | task | noteTarget | taskTarget | else
                - groups payloads by objectSingularName
                -> TimelineActivityRepository.upsertTimelineActivities
                   - 10 minute merge window
                   - writes target<Object>Id morph column
```

Relevant files:

- `src/engine/api/graphql/workspace-query-runner/listeners/entity-events-to-db.listener.ts:110-126`
- `src/modules/timeline/jobs/upsert-timeline-activity-from-internal-event.job.ts:30-37`
- `src/modules/timeline/constants/system-objects-with-timeline-activities.constant.ts`
- `src/modules/timeline/services/timeline-activity.service.ts`
- `src/modules/timeline/repositories/timeline-activity.repository.ts`
- `src/modules/timeline/standard-objects/timeline-activity.workspace-entity.ts`

### 1.2 Storage shape

`timelineActivity` is a workspace object with `happensAt`, `name`, `properties`
(raw JSON holding `diff`), `workspaceMemberId`, the linked-record triple
(`linkedObjectMetadataId`, `linkedRecordId`, `linkedRecordCachedName`), and one
nullable `target<Object>Id` morph FK per object in the workspace.

Those morph columns are generated for every object by
`build-system-relation-flat-field-metadatas-for-object.util.ts`, driven by
`DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [timelineActivity, attachment, noteTarget, taskTarget]`.
A timeline row can therefore point at any non-system object, one at a time.

`name` encodes two things as a string:

- `<objectNameSingular>.<action>` for an event on the record itself
- `linked-<objectNameSingular>.<action>` for an event on a related record

The frontend parses that string in three places (`parseTimelineActivityAction`,
`filterOutInvalidTimelineActivities`, `filterTimelineActivityByLinkedObjectTypes`),
so the format is a contract we keep writing even after a refactor.

### 1.3 Every hardcoded decision

A timeline entry is the product of four independent decisions. All four are
hardcoded, in different places.

**(a) Which events emit at all**

| Rule | Where |
| --- | --- |
| `objectMetadata.isAuditLogged` must be true | `entity-events-to-db.listener.ts:110` |
| `destroyed` never emits | `entity-events-to-db.listener.ts:110` |
| system objects excluded, except an allowlist of two | `upsert-timeline-activity-from-internal-event.job.ts:30` |
| `POSITION` field changes stripped from the diff | `timeline-activity.service.ts:99-154` |
| `updated` with an empty diff dropped | `timeline-activity.repository.ts:51-53` |

`isAuditLogged` is one boolean shared by two consumers (ClickHouse event logs and
timeline activities) with different needs, not editable from settings.

**(b) Which record's timeline receives the entry**

1. Default: the record itself, into `target<sourceObject>Id`.
2. Notes and tasks: traverse to linked records, written twice, once per direction.
   - `computeTimelineActivityPayloadsForActivities` (`timeline-activity.service.ts:232`)
     handles `note.*` / `task.*` using the hardcoded map
     `{ note: 'noteTarget', task: 'taskTarget' }` and the FK convention
     `` `${activityType}Id` ``.
   - `computeTimelineActivityPayloadsForActivityTargets` (`:323`) handles
     `noteTarget.*` / `taskTarget.*`, finding the parent by scanning
     `event.properties.after` for "the first key ending in `Id` that is not
     `noteId`/`taskId` and is not null".

Nothing else fans out. A custom object with a many-to-one to `company` produces
nothing on the company timeline. Attachments produce nothing anywhere, despite
carrying the same target morph as notes and tasks.

**(c) What is stored**

| Rule | Where |
| --- | --- |
| linked row label comes from a field literally named `title` | `timeline-activity.service.ts:301,429` |
| a note/task update with no `title` change produces no linked row | `timeline-activity.service.ts:301-306` |
| `linked-` prefix in `name` | `timeline-activity.service.ts:309,426` |
| the whole diff is persisted, unfiltered by permissions | `timeline-activity.repository.ts:159-169` |

**(d) How entries collapse**

`upsertTimelineActivities` merges into an existing row when target FK,
`workspaceMemberId`, `name` and `linkedRecordId` all match and the row is younger
than 10 minutes. Merge is a per-field diff union (`objectRecordDiffMerge`). The
window, group key and merge function are constants in code.

### 1.4 Findings worth fixing regardless of the design chosen

1. **`computeTimelineActivityPayloadsForActivities` looks broken.**
   `timeline-activity.service.ts:311` reads
   `activityTarget[targetColumn.replace(/Id$/, '')]`, so for a `noteTarget` row it
   reads `targetPerson` (a relation property, not hydrated by the `find` above)
   instead of `targetPersonId`, making `recordId` undefined. It then sets
   `objectSingularName: objectMetadata.nameSingular`, which for a `note.updated`
   event is `note`, so the repository writes `targetNoteId` rather than the
   parent's column. Net effect: renaming a note appears to insert rows with no
   target instead of landing on linked records' timelines. The sibling method does
   it correctly via `extractObjectSingularNameFromTargetColumnName`. Needs an
   integration test before anything else, so the refactor can be verified as
   behavior-preserving (or as a deliberate fix).

2. **`findRecentTimelineActivities` uses `take: 1`** for a whole batch
   (`timeline-activity.repository.ts:134`), then matches that single row against
   every payload. At most one payload per batch can merge.

3. **The frontend supports linked object types the backend never writes.**
   `EventRowDynamicComponent` has cases for `message` and `calendarEvent`, but the
   only producer of `linked-message` / `linked-calendarEvent` rows is the dev
   seeder. In a real workspace those rows never exist: messages and calendar
   events reach the timeline through separate read-time resolvers
   (`core-modules/messaging/timeline-messaging.resolver.ts`,
   `core-modules/calendar/timeline-calendar-event.resolver.ts`). There are two
   parallel timeline mechanisms.

4. **`TimelineConfigurationDTO` is empty.** The page-layout timeline widget already
   has a configuration slot with nothing in it. That is the home for read-time
   display preferences, deliberately kept separate from the write-time rules here.

5. **Diffs are written without permission filtering.** The backend persists the full
   diff and the frontend hides unreadable fields. Any rule system that fans a
   child's changes onto a parent widens that gap.

## 2. The junction relation is the missing backbone

`noteTarget` and `taskTarget` are junction objects, and the metadata layer already
has a first-class concept for exactly this shape.

A **junction relation** is a `ONE_TO_MANY` field carrying
`settings.junctionTargetFieldId` (universal form
`junctionTargetFieldUniversalIdentifier`), pointing at the field on the junction
object that leads to the far side. It is validated by
`flat-field-metadata/validators/utils/validate-junction-target-settings.util.ts`,
which requires the source field to be `ONE_TO_MANY`, requires the target field to
live on the junction object, and **explicitly allows the target to be a
`MORPH_RELATION`** (`:111-114`). The frontend already models and edits it
(`getJunctionConfig.ts`, `SettingsDataModelFieldRelationJunctionForm.tsx`).

Two facts make this the right backbone:

- **Polymorphic junctions already resolve.** On the backend a morph relation is
  one `FlatFieldMetadata` row per member sharing a `morphId`, and
  `resolveMorphRelationsFromFlatFieldMetadata` expands any single member to the
  whole group via `findAllOthersMorphRelationFlatFieldMetadatasOrThrow`. So a rule
  can reference one `fieldMetadataId` and the engine derives every target object.

- **Notes and tasks are the only junctions that do not declare it.**
  `messageList.members` and `person.listMemberships` set
  `junctionTargetFieldUniversalIdentifier`
  (`compute-message-list-standard-flat-field-metadata.util.ts:205`,
  `compute-person-standard-flat-field-metadata.util.ts:520`). `note.noteTargets`
  and `task.taskTargets` do not
  (`compute-note-standard-flat-field-metadata.util.ts:242-244`). The gap is
  already known and papered over: `get-is-flat-field-a-junction-relation-field.ts`
  carries `// TODO: refactor this when we remove hard-coded activity relations`
  above a literal `flatField.name === 'note' || flatField.name === 'task'`.

Declaring the junction target on `note.noteTargets` and `task.taskTargets` is a
metadata-only change that deletes that TODO and turns the note/task fan-out from
a special case into an instance of a general concept. It is the prerequisite for
everything below.

## 3. Two directions, two mechanisms

"Which related object produces a timeline activity on its parent" has a twin that
gets asked just as often: show people's activity on the company timeline, show
company activity on the opportunity timeline, and sometimes the reverse. These are
not the same feature, and the difference is not cosmetic. The cost profiles are
inverted.

Take any relation edge between a child object A holding the foreign key and a
parent object B:

- Putting **A's activity on B's timeline** is cheap to materialize, because each A
  record has exactly one B, so one event writes one extra row. It is expensive to
  resolve at read time, because reading B means reaching across all of its A
  records.
- Putting **B's activity on A's timeline** is the mirror image. Materializing it
  means one event on B writes a row on every one of its A records, which is
  unbounded. Resolving it at read time is a join to a single record.

The mechanism should follow whichever direction is bounded. That gives two
constructs, and the model needs both.

**Emission (materialized, write time).** Events on this object produce a timeline
entry on the records reached through this relation. Selective: an emission carries
its own actions, trigger fields, label and aggregation. The self rule and the
note/task fan-out are emissions.

**Inheritance (resolved, read time).** This object's timeline also shows the
entries already targeting the records reached through this relation. Whole-feed:
it creates nothing, it widens a query.

### 3.1 Inheritance composes with emission, which is why there is no path array

The case that breaks a pure emission model is "notes attached to a person should
appear on the company timeline". That is `note -> person -> company`, two hops, and
no bounded emission expresses it. An earlier draft of this document proposed a path
array to cover it.

It is not needed. The note emission already writes a row targeting the person, and
the company inherits rows targeting its people, so the note appears on the company
timeline with no extra rule and no extra write:

```
note.updated
  -> emission (note -> note.noteTargets)      writes row { targetPersonId: P }
                                              writes row { targetCompanyId: C } (direct link)
read company C's timeline
  -> own rows                                 { targetCompanyId: C }
  -> inheritance (company -> company.people)  { targetPersonId IN people(C) }  <- the note on P
```

Single-hop emissions plus inheritance edges cover the transitive cases. Every hop
in the chain stays bounded, and no rule ever needs to describe more than one
relation. This is the main reason to add inheritance rather than multi-hop paths.

Note the dependency: inheritance surfaces rows that exist. Person rows exist only
because `person` has a self emission. Turning off an object's self emission
silently empties whatever inherits from it.

### 3.2 The validity matrix

For a rule attached to an object, walking one relation field, with an explicit
resolution:

| Field shape | `MATERIALIZED` (emission) | `INHERITED` |
| --- | --- | --- |
| `null` (self) | the default self rule | meaningless, rejected |
| `MANY_TO_ONE`, e.g. `person.company` | person events write on the company, fan-out 1 | company rows show on the person, join to 1 |
| `ONE_TO_MANY` + `junctionTargetFieldId`, e.g. `note.noteTargets` | note events write on the targets, bounded by junction rows | target rows show on the note |
| `ONE_TO_MANY` plain, e.g. `company.people` | **rejected**, unbounded write fan-out | people rows show on the company, one subquery |

One rejection, and it is the only cell where the work is unbounded. The shape that
the emission-only model had to reject outright is exactly the shape inheritance
handles correctly. Every request we have on file lands somewhere in this table:

| Ask | Rule |
| --- | --- |
| notes and tasks on their targets | `MATERIALIZED note -> note.noteTargets` (standard) |
| people's activity on the company timeline | `INHERITED company -> company.people` |
| notes on a person visible on the company | falls out of the two rows above |
| company activity on the opportunity timeline | `INHERITED opportunity -> opportunity.company` |
| opportunity activity on the company timeline | either `INHERITED company -> company.opportunities` or `MATERIALIZED opportunity -> opportunity.company` |

The last row is the interesting one: both directions are valid and the choice is a
real tradeoff. Inheritance is retroactive and costs nothing to write, but it is
all-or-nothing. Emission is selective (only stage changes, with its own label and
aggregation) and cheap to read, but it applies only from the moment it is enabled.

### 3.3 Resolution is explicit, not derived

It is tempting to derive the resolution from the field shape, since three of the
four rows above have only one valid cell. Junctions break it: `note.noteTargets`
and `company.noteTargets` are both `ONE_TO_MANY` + junction, and they mean opposite
things. So `resolution` is a stored column, validated against the matrix.

### 3.4 What inheritance costs

Inheritance needs a read path that today does not exist. The frontend currently
queries `timelineActivity` through the generic `useFindManyRecords` with
`{ targetCompanyId: { eq: X } }`. Widening that to inherited sources must not
happen by expanding child ids into an `in` filter: a company with ten thousand
people would ship ten thousand UUIDs through the API.

It needs a dedicated resolver that builds the predicate server-side:

```sql
WHERE ta."targetCompanyId" = $1
   OR ta."targetPersonId" IN (SELECT id FROM person WHERE "companyId" = $1)
```

Three properties make this much less alarming than it sounds:

- **It stays inside one table.** Inheritance never unions heterogeneous sources, so
  ordering and cursor pagination remain a single ordinary query. This is the
  decisive difference from the messages and calendar read-time resolvers, which do
  union different tables and are correspondingly awkward.
- **It is where permission filtering belongs anyway.** Inheriting person rows onto
  a company timeline means a reader with company access but not person access would
  otherwise see person activity, so server-side filtering stops being a nice-to-have
  and becomes a precondition. The same resolver fixes finding 1.4.5 for every row,
  inherited or not.
- **It is the convergence point.** Once a `recordTimeline` resolver exists, the
  messages and calendar sources have somewhere to live, which is the beginning of an
  answer to the two-mechanisms problem in section 10.

Two limits to set from the start: inheritance does **not** chain (depth 1), so
reading an opportunity that inherits its company does not also pull in what the
company inherits, and the edge set must be validated acyclic so
`company -> people -> company` cannot be configured. Depth 1 keeps the read query
non-recursive; depth N is a later decision, not a later accident.

Index note: each `target<Object>Id` has a single-column index today
(`compute-timeline-activity-standard-flat-index-metadata.util.ts`). An inheritance
predicate sorted by `createdAt DESC LIMIT n` wants composite
`(target<Object>Id, createdAt DESC)` indexes, which should land with the resolver,
not before.

## 4. Decisions

### 4.1 Default rules are derived, not materialized

**Derive defaults from metadata, persist only overrides.**

`isTimelineLogged` is never added, and the existence of a row is not the indicator
either. A pure function turns object and field metadata into the effective rule
set; rows exist only where someone changed something. This mirrors how standard
metadata already handles `overrides`.

```ts
computeEffectiveTimelineActivityRules({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatTimelineActivityRuleMaps,
}): Map<objectMetadataId, EffectiveTimelineActivityRule[]>
```

Derivation, chosen to reproduce today exactly:

- a **self emission** for every object where `isAuditLogged && !isSystem`
- nothing for system objects, so `attachment`, `workspaceMember` and
  `workflowVersion` stay silent exactly as the current allowlist makes them
- **no derived inheritance at all**, so the read path starts empty
- the note and task fan-out emissions are **not** derived either. Deriving one per
  junction relation would silently switch on `messageList.members`. They ship as
  two explicit rows owned by the twenty-standard-application, created by the same
  sync that creates every other standard metadata row, so there is no backfill
  command

Persisted rows merge onto derived ones by the natural key. A row with
`isActive: false` disables its derived counterpart, which is how a timeline is
turned off without a boolean column. `isAuditLogged` keeps its current meaning,
because the derivation reads it.

The alternatives were materializing a self rule per object (uniform, but a backfill
of every object of every workspace and a row per custom object forever) and keeping
a boolean for self with rows only for fan-out (no backfill, but the self rule then
cannot carry field filters or aggregation, and settings has to render two
mechanisms for one question).

API consequence: queries return **effective** rules with `id: string | null`, where
`null` means derived and not yet persisted. Mutations upsert on the natural key,
not on `id`. Editing a derived rule materializes it, and the frontend never has to
know which kind it is looking at.

### 4.2 Rules are keyed on the relation, presented per target object

**One row per `(object, relation field, resolution)`, with an optional
`targetObjectMetadataIds` filter for morph members.**

Storage wants the relation; a settings screen reads better target-first. These need
not match, because a rule's target set is derivable from the flat maps with no
query: `relationFieldMetadataId` to `junctionTargetFieldId` to a morph member to its
`morphId` to every member to each `relationTargetObjectMetadataId`. So the API can
expose a target-first index over relation-keyed rows.

Storage then stays proportional to relations rather than to relations times
objects, which matters because a morph junction gains a member every time a custom
object is created. Target-keyed storage would have needed a new row per custom
object per rule.

Inheritance rows are already reader-keyed, so the target-first view is native for
half the model and derived for the other half.

`targetObjectMetadataIds` is a filter, not part of the identity, so two rules on the
same relation with different morph subsets are deliberately not representable.

### 4.3 One `actions` list, with `linked` and `unlinked` as first-class actions

A junction relation has two event streams: the source record changing
(`note.updated`) and the link itself changing (`noteTarget.created`). An earlier
draft split these into `sourceActions` and `linkActions`. That is worse, because
`created` then means two different things depending on which list it appears in.

A single list over an enum with distinct values has no such ambiguity:

```
created | updated | deleted | restored | linked | unlinked
```

`linked` already exists in the shared `TimelineActivityAction` union; only
`unlinked` needs adding. What produces a link event depends on the target field:

| Target field | `linked` / `unlinked` mean |
| --- | --- |
| `null` (self) | never emitted |
| junction | a junction row was created / deleted |
| `MANY_TO_ONE` | the foreign key started / stopped pointing at the record (see 4.5) |

This is what makes 4.5 fall out cleanly rather than needing its own mechanism: a
foreign key moving is a link and an unlink, exactly like a junction row appearing
and disappearing.

To stay faithful, phase 2 keeps writing today's names, so a junction row created
still stores `name: "linked-note.created"`. The structured `action` column
introduced in phase 3 carries the true value (`linked`), and it is authoritative;
`name` is legacy compatibility. Frontend readers migrate to the column in phase 6.

### 4.4 Emissions apply from now on; inheritance is retroactive

**Enabling an emission creates no history. Enabling an inheritance surfaces all of
it immediately.**

No backfill for emissions, and not merely because it is cheaper. A timeline row
needs the diff as it was at the time of the event, and only the timeline write path
captures that. The ClickHouse event log is the one other record of the past, it is
optional (`workspaceEventSinkService.isEnabled()`), and it is actively pruned by
`event-logs/cleanup/crons/event-log-cleanup.cron.job.ts`. A backfill built on it
would be silently partial, which is worse than none.

Inheritance has the opposite property for free, since it only widens a query. That
asymmetry is a genuine product difference the settings UI has to communicate, and
it is a good reason to prefer inheritance when a user's motivation is "I want to see
the history I already have".

### 4.5 A changed many-to-one emits on both sides

When `contract.companyId` moves from A to B, A's timeline gets an `unlinked` entry
and B's gets a `linked` entry, in addition to the ordinary `updated` entry that the
rule's `sourceActions` may produce on B.

Mechanically: on an `updated` event, the engine compares the relation's join column
in `properties.before` and `properties.after`. If it changed, it emits `unlinked`
against the before-value and `linked` against the after-value.

This introduces no behavior change, because no `MANY_TO_ONE` emission rule can
exist before the API ships. It therefore lands with phase 5 rather than in phase 6,
so that the first user-created many-to-one rule has complete semantics from the
start.

Worth being explicit about the consequence of the ordinary case: once a
`contract -> company` emission exists, **every** contract update writes a row on the
company timeline, not only foreign key changes. That is the feature, and
`triggerFieldMetadataIds` is how a user narrows it.

### 4.6 The listener keeps its current gate

`EntityEventsToDbListener` is on the hot path and does not have the flat maps
cache. Computing "is this object the source or the junction of any effective
emission?" there would mean a cache read per batch. Enqueuing exactly as today
costs some queue traffic for objects with no rules, and the job discards them
immediately. Optimize later with a cached `Set<objectMetadataId>` if queue volume
shows up. Inheritance never touches this path at all.

## 5. Proposed entity

```ts
// core.timelineActivityRule
@Entity({ name: 'timelineActivityRule', schema: 'core' })
export class TimelineActivityRuleEntity extends SyncableEntity {
  id: string;
  workspaceId: string;

  // MATERIALIZED: the object whose events trigger this rule
  // INHERITED: the object whose timeline is widened by this rule
  objectMetadataId: string;

  // the single relation field to walk. null = the record itself, and is only
  // valid for MATERIALIZED
  relationFieldMetadataId: string | null;

  resolution: 'MATERIALIZED' | 'INHERITED';

  // for morph junction targets, restrict to specific members. null = all
  targetObjectMetadataIds: string[] | null;

  // MATERIALIZED only. created | updated | deleted | restored | linked | unlinked
  actions: JsonbProperty<TimelineActivityRuleAction[]>;

  // MATERIALIZED only, null = any field. Only meaningful for `updated`
  triggerFieldMetadataIds: string[] | null;

  // MATERIALIZED only, diff keys to persist. null = all
  payloadFieldMetadataIds: string[] | null;

  // MATERIALIZED only. Supplies linkedRecordCachedName. null = the object's label
  // identifier, which is what replaces the hardcoded `title` lookup
  labelFieldMetadataId: string | null;

  // MATERIALIZED only
  aggregation: JsonbProperty<TimelineActivityRuleAggregation> | null;

  isActive: boolean;
  isSystemSideEffect: boolean;
}
```

The `MATERIALIZED only` columns being null for inheritance rows is the one wart of
keeping both constructs in one table. It buys a single pass through the ~40 file
metadata pipeline in section 8 instead of two, which is worth more than the purity.
A discriminated DTO keeps the API honest even though the table is not.

Uniqueness needs two partial indexes, because Postgres does not dedupe NULLs:

```sql
CREATE UNIQUE INDEX ... ON "timelineActivityRule" ("workspaceId", "objectMetadataId")
  WHERE "relationFieldMetadataId" IS NULL;
CREATE UNIQUE INDEX ... ON "timelineActivityRule"
  ("workspaceId", "objectMetadataId", "relationFieldMetadataId", "resolution")
  WHERE "relationFieldMetadataId" IS NOT NULL;
```

`resolution` is part of the key because emitting along an edge and inheriting along
the same edge are independent and can coexist.

### 5.1 Today's behavior as rules

| Rule | object | relation field | resolution | origin |
| --- | --- | --- | --- | --- |
| self changes | every object with `isAuditLogged && !isSystem` | `null` | MATERIALIZED | derived, no row |
| notes on their targets | `note` | `note.noteTargets` | MATERIALIZED | standard row |
| tasks on their targets | `task` | `task.taskTargets` | MATERIALIZED | standard row |

Three concepts replace four hardcoded branches, two of which were duplicates of
each other. The note and task rows differ from a user-created rule only in who owns
them.

### 5.2 Write engine

```
UpsertTimelineActivityFromInternalEvent
  -> TimelineActivityRuleResolverService
       MATERIALIZED rules for (objectMetadataId, action), plus rules whose junction
       object is this object. Read from the flat entity maps cache, memoized per
       metadata version, no query per event
  -> TimelineActivityTargetResolverService
       walks the single relation hop in batch (one query per junction, In(ids)),
       returns { targetObjectMetadataId, targetRecordId } per event
  -> TimelineActivityPayloadBuilder
  -> TimelineActivityRepository.upsert(payloads, rule.aggregation)
```

`TimelineActivityService.upsertEvents` keeps its signature, so the job and the
listener are untouched. The POSITION-field strip becomes a property of the engine
rather than of any rule: no rule should ever emit a position change.

### 5.3 Read engine

```
recordTimeline(objectNameSingular, recordId, first, after)
  -> TimelineActivityRuleResolverService
       INHERITED rules for objectMetadataId
  -> TimelineActivityFilterBuilder
       own target column = recordId
       OR, per inherited edge, an IN (SELECT ...) over the reachable records
  -> one ordinary paginated query on timelineActivity
  -> permission filter on properties.diff by field permissions
```

### 5.4 Structured columns on `timelineActivity`

Additive: `timelineActivityRuleId` (nullable, no FK, so workspace data does not
depend on a metadata delete), `sourceObjectMetadataId`, `action`. They remove the
string parsing that both the merge logic and the frontend rely on, while `name`
keeps being written unchanged.

## 6. Aggregation

Two things get conflated under this word and should not share a model.

**Feed compaction** belongs on a MATERIALIZED rule:

```ts
type TimelineActivityRuleAggregation = {
  strategy: 'NONE' | 'MERGE_DIFF' | 'COUNT';
  windowSeconds: number;
  groupBy: ('TARGET' | 'AUTHOR' | 'LINKED_RECORD' | 'RULE')[];
  maxEventsPerRow: number | null;
};
```

`MERGE_DIFF` with `windowSeconds: 600` and
`groupBy: [TARGET, AUTHOR, LINKED_RECORD, RULE]` is today's behavior and the
default. `COUNT` is what makes high-volume sources usable ("14 emails received"),
and is the reason messages and calendar events are read-time today. Fixing the
`take: 1` bug is a prerequisite for any of it to work on batches.

The current read-then-merge is racy: two workers can both miss the existing row. A
partial unique index on the group key plus a bucket column
(`floor(happensAt / windowSeconds)`) and `INSERT ... ON CONFLICT DO UPDATE` makes it
correct, at the cost of turning sliding windows into fixed buckets. That is a
visible behavior change and therefore a separate, later step.

Inheritance deliberately has no aggregation. Compacting a feed assembled at read
time means grouping after the fact, which breaks cursor pagination. If a
high-volume source needs compaction, it should be emitted with a `COUNT` rule
rather than inherited.

**Record-level rollups** (`company.noteCount`) do not belong here. They are
aggregate fields, with different storage and different invalidation: a rollup must
be recomputed on delete, a timeline row must not. At most they will share the
target resolver later.

## 7. Validation rules

Enforced by the flat validator service, so both the API and application sync get
them:

- `resolution` and field shape must be a valid cell of the 3.2 matrix
- `relationFieldMetadataId` must belong to `objectMetadataId`
- `triggerFieldMetadataIds`, `payloadFieldMetadataIds` and `labelFieldMetadataId`
  must belong to `objectMetadataId`
- every terminal object must be timeline-capable, meaning it has a
  `target<Object>Id` morph member on `timelineActivity`
- `targetObjectMetadataIds`, when set, must be a subset of the morph members the
  relation actually reaches
- INHERITED edges must form an acyclic graph, and are not traversed transitively
  (depth 1)
- per-object caps: a maximum number of INHERITED edges (read cost) and a maximum
  `maxFanOutPerEvent` for MATERIALIZED junction rules (write cost)

## 8. Cost of a new metadata entity

Adding `timelineActivityRule` to `ALL_METADATA_NAME` pulls in the full metadata
pipeline. Using `searchFieldMetadata` as the reference implementation, the checklist
is roughly 40 non-generated files:

- entity, module, DTO, exceptions under `metadata-modules/timeline-activity-rule/`
- flat entity type, maps type, map cache service and converters under
  `metadata-modules/flat-timeline-activity-rule/`
- eight registrations in `flat-entity/constant/`:
  `all-metadata-entity-by-metadata-name`,
  `all-entity-properties-configuration-by-metadata-name`,
  `all-many-to-one-metadata-foreign-key`, `all-many-to-one-metadata-relations`,
  `all-one-to-many-metadata-relations`, `all-metadata-serialized-relation`,
  `all-metadata-required-metadata-for-validation`,
  `all-metadata-side-effect-companion-metadata-names`
- universal flat entity type and the jsonb serialization constant
- workspace migration: actions type, actions builder service, validator service,
  three action handlers, the three
  `optimistically-apply-*-action-on-all-flat-entity-maps` utils, the three
  `derive-metadata-events-from-*-action` utils, `metadata-event-to-emit`,
  `compute-ordered-migration-actions`, and the build orchestrator
- twenty-standard-application: the two standard rows and their inclusion in
  `twenty-standard-application-all-flat-entity-maps`
- a fast instance command for the table

Nothing here is novel work, but it is the dominant cost and the reason to settle
section 4 before writing code. Holding both resolutions in one entity is what keeps
this to one pass.

## 9. Plan

Behavior-preserving through phase 5.

**Phase 0: pin current behavior.** Integration tests for self changes on a standard
and a custom object, note and task create/update/link/unlink, the POSITION
exclusion, the system-object gate, and the 10-minute merge. This is where finding
1.4.1 is confirmed and where we decide whether the refactor reproduces the bug or
fixes it. No production code changes.

**Phase 1: declare the junctions.** Add `junctionTargetFieldUniversalIdentifier` to
`note.noteTargets` and `task.taskTargets`, pointing at
`STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier` and its task
equivalent (any morph member; the engine expands the group via `morphId`). Delete
the `flatField.name === 'note' || flatField.name === 'task'` special case in
`get-is-flat-field-a-junction-relation-field.ts` and its TODO. Add a workspace
command to backfill the setting on existing workspaces, mirroring
`2-25-workspace-command-...-backfill-message-list-members-junction-target.command.ts`.
Small, independently valuable, prerequisite for phase 2.

**Phase 2: extract the write engine, rules in code.** Introduce the rule type, the
rule resolver, the target resolver and the payload builder. Effective rules come
from the derivation function plus a `STANDARD_TIMELINE_ACTIVITY_RULES` constant
holding the two fan-out emissions. Delete the four hardcoded branches and
`SYSTEM_OBJECTS_WITH_TIMELINE_ACTIVITIES`. Fix the `take: 1` batch bug. No schema
change, no API change, phase 0 tests unchanged.

**Phase 3: structured columns.** Add `timelineActivityRuleId`,
`sourceObjectMetadataId` and `action` to `timelineActivity`, populate going forward,
keep writing `name`. Fast instance command.

**Phase 4: rules become metadata.** Add the entity and the pipeline from section 8,
with the validator rejecting `INHERITED` until phase 6. The two standard rules move
from the constant into the standard application. The resolver merges persisted rows
onto derived rules. Still no behavior change, because the merged result equals the
previous constant.

**Phase 5: emission API.** Metadata queries and mutations over effective rules,
permission-flagged like other metadata, upserting on the natural key, with the
validation of section 7. Add `unlinked` to the shared action union and implement the
many-to-one link/unlink pair from 4.5. Frontend work on emissions can start.

**Phase 6: inheritance.** Add the `recordTimeline` resolver, the composite
`(target<Object>Id, createdAt DESC)` indexes, and server-side permission filtering
of diffs for every row. Allow `INHERITED` rules. Migrate the frontend timeline query
off the generic `findMany`, and migrate its `name` parsing onto the structured
`action` column.

**Phase 7: the remaining behavior changes**, each with its own decision: let
attachments fan out, add `COUNT` aggregation, switch junction link rows from
`.created`/`.deleted` to `.linked`/`.unlinked` in `name`, and decide whether
messages and calendar events move into the `recordTimeline` resolver.

## 10. Remaining risks

- **Write amplification.** Every enabled emission multiplies inserts by its fan-out.
  The `maxFanOutPerEvent` cap and a per-workspace rule cap are needed before rules
  are user-editable, not after. Steering users toward inheritance where it fits is
  the better mitigation.
- **Read amplification.** Every inherited edge adds a subquery to every timeline
  read for that object. The per-object edge cap and the composite indexes are the
  mitigation; a company with a very large `people` set is the shape to benchmark
  before shipping phase 6.
- **Permissions.** Inheritance makes server-side diff filtering mandatory rather
  than optional, which is why it is scheduled in the same phase.
- **Metadata deletion.** Timeline rows survive (they are workspace data and `name`
  remains self-describing), rules cascade with their object, and a rule whose
  relation field was deleted is deactivated rather than deleted, so the failure is
  visible.
- **Two timeline mechanisms.** Messages and calendar events are read-time,
  everything else is materialized. The `recordTimeline` resolver from phase 6 is the
  first place they could genuinely converge, but they union heterogeneous tables
  where inheritance does not, so unifying them is a real design exercise rather than
  a move. It does not block phases 0 through 6.
