# Timeline activities: audit and configurability proposal

Backend only. The goal of this document is to describe exactly what is hardcoded
today, define what "a related object produces a timeline activity on its parent"
actually means, and propose a structure that makes it configurable per workspace
without changing any end-user behavior in the first steps.

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

`timelineActivity` is a workspace object with:

- `happensAt`, `name`, `properties` (raw JSON, holds `diff`)
- `workspaceMemberId` (author)
- `linkedObjectMetadataId`, `linkedRecordId`, `linkedRecordCachedName`
- one nullable `target<Object>Id` morph FK per object in the workspace

The morph columns are generated for every object by
`buildSystemRelationFlatFieldMetadatasForObject`
(`src/engine/metadata-modules/object-metadata/utils/`), driven by
`DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [timelineActivity, attachment, noteTarget, taskTarget]`.
So a timeline row can point at any non-system object, but only one at a time.

`name` is a string that encodes two things:

- `<objectNameSingular>.<action>` for an event on the record itself
- `linked-<objectNameSingular>.<action>` for an event on a related record

The frontend parses this string in three places
(`parseTimelineActivityAction`, `filterOutInvalidTimelineActivities`,
`filterTimelineActivityByLinkedObjectTypes`), so the format is a public contract
we have to keep writing even after a refactor.

### 1.3 Every hardcoded decision, enumerated

A timeline entry is the product of four independent decisions. All four are
currently hardcoded, in different places.

**(a) Which events emit at all**

| Rule | Where |
| --- | --- |
| `objectMetadata.isAuditLogged` must be true | `entity-events-to-db.listener.ts:110` |
| `destroyed` never emits | `entity-events-to-db.listener.ts:110` |
| system objects are excluded, except an allowlist of two | `upsert-timeline-activity-from-internal-event.job.ts:30`, `system-objects-with-timeline-activities.constant.ts` |
| `POSITION` field changes are stripped from the diff | `timeline-activity.service.ts:99-154` |
| `updated` with an empty diff is dropped | `timeline-activity.repository.ts:51-53` |

`isAuditLogged` is a single boolean shared by two consumers (event logs and
timeline activities) with different needs. It is exposed in object metadata but
not editable from settings, and it cannot express "log this to ClickHouse but do
not clutter the timeline".

**(b) Which record's timeline receives the entry (the fan-out)**

Two hardcoded behaviors:

1. Default: the record itself. `recordId` goes into
   `target<sourceObject>Id`.
2. Notes and tasks: traverse to the linked records. This is written twice, once
   per direction:
   - `computeTimelineActivityPayloadsForActivities` (`timeline-activity.service.ts:232`)
     handles `note.*` / `task.*` by loading `noteTarget` / `taskTarget` rows via
     the hardcoded map `{ note: 'noteTarget', task: 'taskTarget' }` and the
     hardcoded FK convention `` `${activityType}Id` ``.
   - `computeTimelineActivityPayloadsForActivityTargets` (`timeline-activity.service.ts:323`)
     handles `noteTarget.*` / `taskTarget.*`, and finds the parent by scanning
     `event.properties.after` for "the first key that ends in `Id`, is not
     `noteId`/`taskId`, and is not null".

Nothing else fans out. A custom object with a many-to-one relation to `company`
produces no entry on the company timeline. Attachments produce nothing anywhere,
because `attachment` is a system object and is not in the allowlist, even though
it carries the same target morph as notes and tasks.

**(c) What is stored in the entry**

| Rule | Where |
| --- | --- |
| linked row label comes from a field literally named `title` | `timeline-activity.service.ts:301,429` |
| a note/task update with no `title` change produces no linked row at all | `timeline-activity.service.ts:301-306` |
| `linked-` prefix in `name` | `timeline-activity.service.ts:309,426` |
| the whole diff is persisted, unfiltered by permissions | `timeline-activity.repository.ts:159-169` |

**(d) How entries collapse (the only aggregation we have today)**

`TimelineActivityRepository.upsertTimelineActivities` merges a new event into an
existing row when all of the following match: same target FK, same
`workspaceMemberId`, same `name`, same `linkedRecordId`, and the existing row is
younger than 10 minutes. Merge strategy is a per-field diff union
(`objectRecordDiffMerge`), keeping the oldest `before` and the newest `after`.

The window, the group key and the merge function are all constants in code.

### 1.4 Findings worth fixing regardless of the design chosen

1. **`computeTimelineActivityPayloadsForActivities` looks broken.**
   `timeline-activity.service.ts:311` reads
   `activityTarget[targetColumn.replace(/Id$/, '')]`, so for a `noteTarget` row it
   reads `targetPerson` (the relation property, not loaded by the `find` call
   above) instead of `targetPersonId`. `recordId` is therefore `undefined`. It
   then sets `objectSingularName: objectMetadata.nameSingular`, which for a
   `note.updated` event is `note`, so the repository writes to `targetNoteId`
   rather than to the parent's column. Net effect: renaming a note appears to
   insert rows with no target instead of appearing on the linked records'
   timelines. Sibling method
   `computeTimelineActivityPayloadsForActivityTargets` does it correctly, using
   `extractObjectSingularNameFromTargetColumnName`. Worth an integration test
   before touching anything else, so the refactor can be verified as truly
   behavior-preserving (or a deliberate fix).

2. **`findRecentTimelineActivities` uses `take: 1`** for the whole batch
   (`timeline-activity.repository.ts:134`), then matches that single row against
   every payload. With a batch touching several records, at most one payload can
   merge. The merge window is effectively per batch-with-one-record only.

3. **The frontend supports linked object types the backend never writes.**
   `EventRowDynamicComponent` has cases for `message` and `calendarEvent`, and
   `filterTimelineActivityByLinkedObjectTypes` exists, but the only producer of
   `linked-message` / `linked-calendarEvent` rows is
   `dev-seeder/data/services/timeline-activity-seeder.service.ts`. In a real
   workspace those rows never exist. Messages and calendar events reach the
   timeline through separate read-time resolvers
   (`core-modules/messaging/timeline-messaging.resolver.ts`,
   `core-modules/calendar/timeline-calendar-event.resolver.ts`), which is a
   second, parallel timeline mechanism.

4. **`TimelineConfigurationDTO` is empty.** The page-layout timeline widget
   already has a configuration slot
   (`metadata-modules/page-layout-widget/dtos/timeline-configuration.dto.ts`)
   with nothing in it. That is the natural home for read-time preferences, and it
   should not be confused with the write-time rules discussed here.

5. **Diffs are written without permission filtering.** The backend persists the
   full diff and the frontend hides unreadable fields
   (`filterOutInvalidTimelineActivities`). Any rule system that fans out changes
   from a child object onto a parent widens the blast radius of that gap, because
   a user who can read the parent will receive rows describing a child they may
   not be allowed to read.

## 2. What "a related object produces a timeline activity on its parent" means

Making this configurable requires naming the four decisions above as first-class
concepts, because a user-facing toggle is really a bundle of all four.

Concretely, "show note changes on the company timeline" means:

1. **Trigger**: events on `note` (and on `noteTarget`, for link/unlink), for the
   actions `created | updated | deleted | restored`, optionally restricted to a
   set of fields.
2. **Fan-out path**: from a `note` record, reach `company` records. Here the path
   is two hops: `note -> noteTargets` (one-to-many) then
   `noteTarget -> targetCompany` (many-to-one). For a custom `contract` object
   with `contract.companyId`, the path is one hop.
3. **Payload**: which diff keys to persist, and which field of the source record
   supplies `linkedRecordCachedName`.
4. **Aggregation**: whether N events collapse into one row, on what key, over
   what window, and with what merge strategy.

Two properties of the fan-out matter a lot for the design:

- **Terminal object must be timeline-capable.** The target object needs a
  `target<Object>Id` morph column on `timelineActivity`. Today every non-system
  object has one. A rule whose path ends on a system object (`message`,
  `workspaceMember`) cannot be materialized without adding that column first, so
  the rule model has to validate this and the metadata layer has to be able to
  add the morph member on demand.
- **Fan-out must be bounded.** A path that traverses a one-to-many from the
  source side is fine (a note has a handful of targets). A path that traverses a
  one-to-many in the "downward" direction is not (updating a company would write
  a row on every person of that company). The rule model needs an explicit
  cardinality guard, not a comment.

## 3. Options

### Option A: booleans on existing metadata

Add `isTimelineLogged` on `objectMetadata` (splitting it from `isAuditLogged`),
plus `producesTimelineActivityOnRelatedRecord` on relation `fieldMetadata`.
Evaluation walks the source object's relation fields and emits on each field
flagged true.

- Cheap: two columns, no new metadata entity, fits the existing overrides and
  application-sync machinery for free.
- Expresses one-hop paths only. Notes and tasks are two-hop through a join
  object, so the existing behavior cannot be represented and would have to stay
  hardcoded next to the new generic path. That defeats the purpose.
- No room for field filters, label selection, or aggregation without adding more
  columns per concern.

Reasonable as a stopgap, wrong as a foundation.

### Option B: a `timelineRule` metadata entity (recommended)

A new syncable metadata entity in `core`, one row per rule, joined to object and
field metadata. Rules are data, so the standard application ships the current
behavior as seeded rules, applications can contribute their own, and users can
add or disable rules later.

- Represents one-hop and multi-hop paths uniformly, so notes and tasks stop
  being special cases.
- Carries trigger, payload and aggregation config in one place, and gives the
  future settings UI a single object to CRUD.
- Slots into the existing flat-entity, universal-identifier and
  workspace-migration infrastructure, which is what makes it portable across
  workspaces and shippable inside applications.
- Cost: a new entry in `ALL_METADATA_NAME`, flat entity maps, property
  configuration, validators, a DTO/resolver, and a workspace command to seed the
  existing rules. This is the main cost of the proposal and it is where the
  design should be checked before writing code.

### Option C: a JSONB blob on `objectMetadata`

`objectMetadata.timelineConfiguration: jsonb`, holding an array of rules for that
object.

- Fastest to build, no new entity, no new resolver.
- Loses referential integrity: rules reference field and object ids with no FK,
  so renaming or deleting a field silently breaks rules instead of cascading.
- Not addressable, so no per-rule permissions, no per-rule activation, awkward
  diffing in application sync.
- Ownership is ambiguous for cross-object rules: a rule about notes appearing on
  companies belongs to neither object exclusively.

Acceptable if we decide the feature will stay small. It will not stay small if we
want aggregation.

### Option D: read-time composition instead of materialized rows

Stop writing rows for related objects. Instead resolve the feed at query time by
unioning materialized `timelineActivity` rows with rule-driven queries against
related objects, the way `timeline-messaging.resolver.ts` and
`timeline-calendar-event.resolver.ts` already do for messages and calendar
events.

- Config changes apply retroactively with no backfill, and there is no write
  amplification (today a rule with fan-out F multiplies writes by F).
- Permission filtering happens where the reader is known, which fixes finding 5
  properly.
- Much harder to paginate and sort across heterogeneous sources, and the cost
  moves to every timeline render. Field-level change history cannot be
  reconstructed at read time at all: diffs only exist because we captured them
  when the event happened.

Not an alternative to B so much as a second materialization strategy. The right
move is to model rules once (Option B) and treat materialization as a property of
the rule, so a rule can later be marked read-time without changing its shape.

### Recommendation

Option B, with the rule model designed so Option D can be added later as a
`materialization` discriminator. Option A's columns are still worth having as the
coarse master switch (`isTimelineLogged` split out of `isAuditLogged`), because a
per-object off switch should not require deleting rules.

## 4. Proposed structure

### 4.1 Entity

```ts
// core.timelineRule
@Entity({ name: 'timelineRule', schema: 'core' })
export class TimelineRuleEntity extends SyncableEntity {
  id: string;
  workspaceId: string;

  // object whose database events trigger this rule
  sourceObjectMetadataId: string;

  // ordered relation hops from source to the record receiving the entry.
  // empty array = the source record itself (today's default behavior)
  path: JsonbProperty<TimelineRulePathStep[]>;

  // created | updated | deleted | restored
  actions: JsonbProperty<TimelineRuleAction[]>;

  // null = any field. Only meaningful for the `updated` action
  triggerFieldMetadataIds: string[] | null;

  // diff keys to persist. null = all fields readable by the rule
  payloadFieldMetadataIds: string[] | null;

  // supplies linkedRecordCachedName. null = source object's label identifier
  labelFieldMetadataId: string | null;

  aggregation: JsonbProperty<TimelineRuleAggregation> | null;

  materialization: 'WRITE';  // 'READ' reserved for Option D

  isActive: boolean;
  isSystemSideEffect: boolean;
}
```

```ts
type TimelineRulePathStep = {
  // relation or morph-relation field on the current object. Direction and
  // cardinality are derived from the field's relationType, not restated here
  fieldMetadataId: string;
  // for MORPH_RELATION, restrict to specific morph members. null = all
  morphTargetObjectMetadataIds: string[] | null;
};

type TimelineRuleAggregation = {
  strategy: 'NONE' | 'MERGE_DIFF' | 'COUNT';
  windowSeconds: number;
  groupBy: ('TARGET' | 'AUTHOR' | 'LINKED_RECORD' | 'RULE')[];
  maxEventsPerRow: number | null;
};
```

Two shapes deserve a decision before implementation:

- **Path as field ids vs as a declarative filter.** Field ids keep the model
  closed and validatable, and the flat-entity layer already knows how to convert
  ids to universal identifiers for portability. A filter-expression path would be
  more expressive and much harder to bound.
- **Where a cross-object rule lives.** I would key ownership on
  `sourceObjectMetadataId` (the object whose events trigger it) and rely on the
  path for the target. A rule is then deleted with its source object, which
  matches the "no source, no events" intuition.

### 4.2 Making today's behavior expressible

Seeded rules, shipped by the standard application, that reproduce current
behavior exactly:

| Rule | source | path | actions | notes |
| --- | --- | --- | --- | --- |
| self-changes, per object | every audit-logged object | `[]` | created, updated, deleted, restored | replaces the default branch |
| note on its targets | `note` | `[note.noteTargets, noteTarget.target*]` | created, updated, deleted, restored | replaces `computeTimelineActivityPayloadsForActivities`; `labelFieldMetadataId` = `note.title` |
| task on its targets | `task` | `[task.taskTargets, taskTarget.target*]` | same | same |
| note link/unlink | `noteTarget` | `[noteTarget.target*]` | created, deleted | replaces `computeTimelineActivityPayloadsForActivityTargets` |
| task link/unlink | `taskTarget` | `[taskTarget.target*]` | created, deleted | same |

Notice that the two note rules use the same path prefix from different starting
points, which is exactly the duplication that exists today as two nearly
identical private methods.

The POSITION-field exclusion becomes a property of the engine rather than a rule
(no rule should ever emit a position change), and the `linked-` name prefix
becomes "path is non-empty", which is derivable instead of stringly-typed.

### 4.3 Engine

```
UpsertTimelineActivityFromInternalEvent
  -> TimelineRuleResolverService.getRulesForSourceObject(workspaceId, objectMetadataId, action)
       from the flat entity maps cache, no query per event
  -> TimelineRulePathResolverService.resolveTargets(rule, events)
       walks path steps in batch (one query per hop, In(ids)), returns
       { targetObjectMetadataId, targetRecordId } per event
       enforces maxFanOutPerEvent
  -> TimelineActivityPayloadBuilder.build(rule, event, targets)
  -> TimelineActivityRepository.upsert(payloads, rule.aggregation)
```

Three services, each independently testable, replacing the current branching
service. `TimelineActivityService` keeps its public `upsertEvents` signature so
the job and the listener do not change.

### 4.4 Structured columns on `timelineActivity`

Additive, and worth doing early because it removes the string parsing that both
the merge logic and the frontend rely on:

- `timelineRuleId` (nullable, no FK to keep workspace data independent of a
  metadata delete)
- `sourceObjectMetadataId`, `action`

Keep writing `name` in the current format indefinitely for backward
compatibility with existing rows and with the frontend. New readers prefer the
columns and fall back to parsing `name`.

## 5. Aggregation

Today's merge is one hardcoded point in a much larger space. Two distinct
concerns get conflated when people say "aggregation" here, and they should not
share a model.

**Feed compaction** (in scope for `timelineRule.aggregation`): collapsing many
events into one timeline row.

- `NONE`: one row per event.
- `MERGE_DIFF`: today's behavior. Union the diffs of events sharing the group
  key within the window.
- `COUNT`: one row carrying `properties.count`, incremented in place. This is
  what makes high-volume sources usable ("14 emails received", "3 attachments
  added") and it is the reason messages and calendar events are read-time today.

Fixing the `take: 1` bug (finding 2) is a prerequisite for any of this to work on
batches.

Two mechanisms are possible for the window. The current read-then-merge is
racy under concurrency (two workers can both miss the existing row). A partial
unique index on `(target, ruleId, authorId, linkedRecordId, bucketStartedAt)`
plus `INSERT ... ON CONFLICT DO UPDATE` would make it correct, with the bucket
computed as `floor(happensAt / windowSeconds)`. That changes rows from
sliding-window to fixed-bucket semantics, which is a visible behavior change and
should therefore be a separate, later step.

**Record-level rollups** (out of scope, do not build into `timelineRule`): a
counter materialized on the parent record, for example
`company.noteCount`. That belongs with aggregate fields and the existing
`AggregateOperations` machinery used by views and page-layout widgets, not with
the timeline feed. The two share the notion of "watch a related object", so a
future refactor could share the path resolver, but the storage and invalidation
semantics are entirely different (a rollup must be recomputed on delete, a
timeline row must not).

## 6. Phasing, all behavior-preserving until stated otherwise

**Phase 0: pin current behavior.** Integration tests covering: self-changes on a
standard and a custom object, note and task create/update/link/unlink, the
POSITION exclusion, the system-object gate, and the 10-minute merge. This is
where finding 1 gets confirmed and where we decide whether the refactor
reproduces the bug or fixes it. No production code changes.

**Phase 1: extract the engine, rules in code.** Introduce the rule type, the
resolver, the path resolver and the payload builder. Rules live in a
`TIMELINE_RULES` constant equal to the table in 4.2. Delete the four hardcoded
branches. No schema change, no API change, tests from phase 0 must pass
unchanged.

**Phase 2: structured columns.** Add `timelineRuleId`, `sourceObjectMetadataId`,
`action` to `timelineActivity`, populate them going forward, keep writing `name`.
Fast instance command. Readers keep working on `name`.

**Phase 3: rules become metadata.** Add the `timelineRule` entity, flat entity
maps, property configuration, validators and workspace-migration support. A
workspace command seeds the phase 1 constant as rows. The engine reads from the
flat entity maps cache instead of the constant. Still no behavior change: the
seeded rows are the previous constant.

**Phase 4: expose read APIs.** GraphQL metadata queries and mutations for
`timelineRule`, permission-flagged like other metadata. This is where the
frontend work can start. Validation lives here: path cardinality bound, terminal
object must be timeline-capable, no cycles, field ids must belong to the object
at their hop.

**Phase 5: new capabilities.** Split `isTimelineLogged` from `isAuditLogged`.
Allow attachments to fan out (delete
`SYSTEM_OBJECTS_WITH_TIMELINE_ACTIVITIES` in favor of per-object rules). Add
`COUNT` aggregation. Add server-side permission filtering of diffs. Each of these
is a deliberate behavior change and needs its own decision.

## 7. Risks and open questions

- **Write amplification.** Every enabled rule multiplies inserts by its fan-out.
  A hard `maxFanOutPerEvent` and a per-workspace rule count cap are needed before
  the feature is user-configurable.
- **Backfill.** Enabling a rule does not create history. Either we accept
  "rules apply from now on" (simplest, and what a materialized model implies), or
  we build a backfill job, or we lean on Option D for retroactive sources. This
  should be decided before the frontend is designed, because it changes what the
  UI can promise.
- **Permissions.** Fanning a child's changes onto a parent means a reader of the
  parent sees data about the child. Server-side filtering by object and field
  permissions on the read path should land before rules are user-editable, not
  after.
- **Deleting metadata.** What happens to existing `timelineActivity` rows when a
  rule, a field in a rule's path, or the source object is deleted. Proposal: rows
  survive (they are workspace data, and `name` remains self-describing), rules
  cascade with their source object, and a rule referencing a deleted field is
  deactivated rather than deleted so the failure is visible.
- **Two timeline mechanisms.** Messages and calendar events are read-time and
  everything else is materialized. Whether to unify these under one rule model
  (Option D) is the biggest remaining architectural question, and it is worth
  answering before the settings UI, because it determines whether "which related
  objects appear on this timeline" is one list or two.
