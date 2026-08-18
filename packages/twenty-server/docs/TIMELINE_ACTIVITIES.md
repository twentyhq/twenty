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

## 3. What the rule has to express

Once junction relations are declared, "which related object produces a timeline
activity on its parent" reduces to naming a single relation field, because the
metadata already knows how to walk it.

For a rule with a source object and one target relation field, the engine
supports exactly three field shapes and rejects a fourth:

| Field shape | Traversal | Fan-out | Example |
| --- | --- | --- | --- |
| none (`null`) | the source record itself | 1 | today's default for every object |
| `MANY_TO_ONE` | read the join column from `properties.after`, no query | 1 | `contract.company` |
| `ONE_TO_MANY` + `junctionTargetFieldId` | query junction rows by the source FK, read the junction target join column, expanding morph members | number of junction rows | `note.noteTargets` |
| `ONE_TO_MANY` without junction | **rejected** | unbounded downward | `company.people` |

That closed set covers every behavior we have today and every one we have asked
for, and the rejection is the cardinality guard: a rule may never make one write
fan out across an unbounded child collection.

### 3.1 One rule covers both the source and its junction

A junction relation implies two event sources:

- events on the source object (`note.updated`) mean "the linked thing changed"
- events on the junction object (`noteTarget.created` / `.deleted`) mean "the link
  itself changed"

Today those are the two near-identical private methods. With the junction
declared in metadata the engine derives the second subscription from the rule, so
one row expresses "note activity appears on its targets" and covers editing,
linking and unlinking. This is the strongest argument for keying rules on a
relation field rather than on a generic path array: the path array would have
needed two rows and no way to know they were the same user-facing switch.

The `name` written stays exactly as today: the action comes from whichever event
fired, and the `linked-` prefix is now derivable ("the rule has a target field")
instead of stringly-typed.

## 4. Decisions

Six choices that shape the entity. Each is a recommendation, with the reasoning
and the cost of getting it wrong.

### 4.1 Default rules are derived, not materialized

**Recommended: derive defaults from metadata, persist only overrides.**

`isTimelineLogged` is never added, and the existence of a row is not the
indicator either. A pure function turns object and field metadata into the
effective rule set; rows exist only where someone changed something. This mirrors
how standard metadata already handles `overrides`.

```ts
computeEffectiveTimelineActivityRules({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatTimelineActivityRuleMaps,
}): Map<sourceObjectMetadataId, EffectiveTimelineActivityRule[]>
```

Derivation, chosen to reproduce today exactly:

- a **self rule** for every object where `isAuditLogged && !isSystem`
- nothing for system objects, so `attachment`, `workspaceMember` and
  `workflowVersion` stay silent exactly as the current allowlist makes them
- the note and task **fan-out rules are not derived**. Deriving one per junction
  relation would silently switch on `messageList.members`. They ship as two
  explicit rows owned by the twenty-standard-application, created by the same sync
  that creates every other standard metadata row, so there is no backfill command

Persisted rows merge onto derived ones by the natural key
`(sourceObjectMetadataId, targetFieldMetadataId)`. A row with `isActive: false`
disables its derived counterpart, which is how a timeline is turned off without a
boolean column. `isAuditLogged` keeps its current meaning, because the derivation
reads it.

The alternatives were materializing a self rule per object (uniform, but a
backfill of every object of every workspace and a row per custom object forever)
and keeping a boolean for self with rows only for fan-out (no backfill, but the
self rule then cannot carry field filters or aggregation, and settings has to
render two mechanisms for one question).

API consequence: queries return **effective** rules with `id: string | null`,
where `null` means derived and not yet persisted. Mutations upsert on the natural
key, not on `id`. Editing a derived rule materializes it, and the frontend never
has to know which kind it is looking at.

### 4.2 Rules are keyed on the relation, presented per target object

**Recommended: one row per `(source, target relation)`, with an optional
`targetObjectMetadataIds` filter for morph members.**

The tension is real: storage wants the relation ("where do note changes show
up?"), but a settings screen reads better target-first ("what shows up in
Company's timeline?"). The resolution is that these need not match, because the
target set of a rule is derivable from the flat maps with no query:
`targetFieldMetadataId` to `junctionTargetFieldId` to a morph member to its
`morphId` to every member to each `relationTargetObjectMetadataId`.

So the API can expose a target-first index over relation-keyed rows. Storage stays
proportional to relations rather than to relations times objects, which matters
because a morph junction gains a member every time a custom object is created.
Target-keyed storage would have needed a new row per custom object per rule.

`targetObjectMetadataIds` is a filter, not part of the identity, so two rules on
the same relation with different morph subsets are deliberately not
representable.

### 4.3 Source actions and link actions are separate lists

**Recommended: two columns, `sourceActions` and `linkActions`.**

A junction relation has two event sources: the source record changing
(`note.updated`) and the link itself changing (`noteTarget.created`). One rule
covers both, because the engine derives the junction subscription from the rule.
But whether they are toggled together is a separate question, and splitting one
jsonb column into two now is free, whereas retrofitting it later costs an upgrade
command through the whole metadata pipeline.

Precision matters on the defaults. Today **both** paths accept every action that
arrives, so the faithful default is
`sourceActions = linkActions = [created, updated, deleted, restored]`. Shipping
`linkActions: [created, deleted]` instead is probably what we want, but it is a
behavior change and belongs in phase 6, not smuggled into the refactor.

`linkActions` is meaningless for a self rule and, in the initial engine, for a
`MANY_TO_ONE` target (see 4.5), where it is ignored.

### 4.4 Rules apply from now on, with no backfill

**Recommended: enabling a rule creates no history, and the settings UI says so.**

This is not just the cheap option. Reconstructing a timeline row needs the diff as
it was at the time of the event, and only the timeline write path captures that.
The ClickHouse event log is the one other record of the past, it is optional
(`workspaceEventSinkService.isEnabled()`), and it is actively pruned by
`event-logs/cleanup/crons/event-log-cleanup.cron.job.ts`. A backfill built on it
would be silently partial, which is worse than none.

If retroactive sources become a requirement, the answer is read-time composition
for those sources specifically, not a backfill job.

### 4.5 A changed many-to-one emits on the new value only

**Recommended: read the FK from `properties.after`, ignore `properties.before`,
for now.**

When `contract.companyId` moves from A to B, B's timeline gets the update and A
gets nothing. Emitting an "unlinked" row on A is genuinely useful, but it is new
behavior and needs an `unlinked` action added to the shared
`TimelineActivityAction` union, which the frontend switches on. Defer it to phase
6 as an explicit `emitOnRelationChange` behavior.

Note the consequence of the simple rule: once a `contract -> company` rule exists,
**every** contract update writes a row on the company timeline, not only FK
changes. That is the intended feature, and `triggerFieldMetadataIds` is how a user
narrows it.

### 4.6 The listener keeps its current gate

**Recommended: keep enqueuing the job on `isAuditLogged`, let the job consult the
rules.**

`EntityEventsToDbListener` is on the hot path and does not have the flat maps
cache. Computing "is this object the source or the junction of any effective
rule?" there would mean a cache read per batch. Enqueuing exactly as today costs
some queue traffic for objects with no rules, and the job discards them
immediately. Optimize later with a cached `Set<objectMetadataId>` if the queue
volume shows up.

Corollary: `name` keeps its current format
(`<object>.<action>` / `linked-<object>.<action>`) indefinitely, because three
frontend call sites parse it. The structured columns in 5.3 are additive, and new
readers prefer them.

## 5. Proposed entity

```ts
// core.timelineActivityRule
@Entity({ name: 'timelineActivityRule', schema: 'core' })
export class TimelineActivityRuleEntity extends SyncableEntity {
  id: string;
  workspaceId: string;

  // object whose database events trigger this rule
  sourceObjectMetadataId: string;

  // relation field to walk from the source to the record receiving the entry.
  // null = the source record itself. Must be MANY_TO_ONE, or ONE_TO_MANY with
  // a junctionTargetFieldId
  targetFieldMetadataId: string | null;

  // for morph junction targets, restrict to specific members. null = all
  targetObjectMetadataIds: string[] | null;

  // actions on the source record
  sourceActions: JsonbProperty<TimelineActivityRuleAction[]>;

  // actions on the junction row. Ignored unless the target field is a junction
  linkActions: JsonbProperty<TimelineActivityRuleAction[]>;

  // null = any field. Only meaningful for `updated`
  triggerFieldMetadataIds: string[] | null;

  // diff keys to persist. null = all
  payloadFieldMetadataIds: string[] | null;

  // supplies linkedRecordCachedName. null = source object's label identifier,
  // which is what replaces the hardcoded `title` lookup
  labelFieldMetadataId: string | null;

  aggregation: JsonbProperty<TimelineActivityRuleAggregation> | null;

  isActive: boolean;
  isSystemSideEffect: boolean;
}
```

Uniqueness needs two partial indexes, because Postgres does not dedupe NULLs:

```sql
CREATE UNIQUE INDEX ... ON "timelineActivityRule" ("workspaceId", "sourceObjectMetadataId")
  WHERE "targetFieldMetadataId" IS NULL;
CREATE UNIQUE INDEX ... ON "timelineActivityRule" ("workspaceId", "sourceObjectMetadataId", "targetFieldMetadataId")
  WHERE "targetFieldMetadataId" IS NOT NULL;
```

### 5.1 Today's behavior as rules

| Rule | source | target field | origin |
| --- | --- | --- | --- |
| self changes | every object with `isAuditLogged && !isSystem` | `null` | derived, no row |
| notes on their targets | `note` | `note.noteTargets` | standard row |
| tasks on their targets | `task` | `task.taskTargets` | standard row |

Three concepts replace four hardcoded branches, two of which were duplicates of
each other. The note and task rows differ from a user-created rule only in who
owns them.

### 5.2 Engine

```
UpsertTimelineActivityFromInternalEvent
  -> TimelineActivityRuleResolverService
       effective rules for (sourceObjectMetadataId, action), plus rules whose
       junction object is this object. Read from the flat entity maps cache,
       memoized per metadata version, no query per event
  -> TimelineActivityTargetResolverService
       walks the single relation hop in batch (one query per junction, In(ids)),
       returns { targetObjectMetadataId, targetRecordId } per event
  -> TimelineActivityPayloadBuilder
  -> TimelineActivityRepository.upsert(payloads, rule.aggregation)
```

`TimelineActivityService.upsertEvents` keeps its signature, so the job and the
listener are untouched. The POSITION-field strip becomes a property of the engine
rather than of any rule: no rule should ever emit a position change.

### 5.3 Structured columns on `timelineActivity`

Additive: `timelineActivityRuleId` (nullable, no FK, so workspace data does not
depend on a metadata delete), `sourceObjectMetadataId`, `action`. They remove the
string parsing that both the merge logic and the frontend rely on, while `name`
keeps being written unchanged.

## 6. Aggregation

Two things get conflated under this word and should not share a model.

**Feed compaction** belongs on the rule:

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
(`floor(happensAt / windowSeconds)`) and `INSERT ... ON CONFLICT DO UPDATE` makes
it correct, at the cost of turning sliding windows into fixed buckets. That is a
visible behavior change and therefore a separate, later step.

**Record-level rollups** (`company.noteCount`) do not belong here. They are
aggregate fields, with different storage and different invalidation: a rollup must
be recomputed on delete, a timeline row must not. At most they will share the
target resolver later.

## 7. Cost of a new metadata entity

Adding `timelineActivityRule` to `ALL_METADATA_NAME` pulls in the full metadata
pipeline. Using `searchFieldMetadata` as the reference implementation, the
checklist is roughly 40 non-generated files:

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
section 4 before writing code.

## 8. Plan

Behavior-preserving through phase 5.

**Phase 0: pin current behavior.** Integration tests for self changes on a
standard and a custom object, note and task create/update/link/unlink, the POSITION
exclusion, the system-object gate, and the 10-minute merge. This is where finding
1.4.1 is confirmed and where we decide whether the refactor reproduces the bug or
fixes it. No production code changes.

**Phase 1: declare the junctions.** Add `junctionTargetFieldUniversalIdentifier`
to `note.noteTargets` and `task.taskTargets`, pointing at
`STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier` and its task
equivalent (any morph member; the engine expands the group via `morphId`). Delete
the `flatField.name === 'note' || flatField.name === 'task'` special case in
`get-is-flat-field-a-junction-relation-field.ts` and its TODO. Add a workspace
command to backfill the setting on existing workspaces, mirroring
`2-25-workspace-command-...-backfill-message-list-members-junction-target.command.ts`.
Small, independently valuable, and a prerequisite for phase 2.

**Phase 2: extract the engine, rules in code.** Introduce the rule type, the rule
resolver, the target resolver and the payload builder. Effective rules come from
the derivation function plus a `STANDARD_TIMELINE_ACTIVITY_RULES` constant holding
the two fan-out rules. Delete the four hardcoded branches and
`SYSTEM_OBJECTS_WITH_TIMELINE_ACTIVITIES`. Fix the `take: 1` batch bug. No schema
change, no API change, phase 0 tests unchanged.

**Phase 3: structured columns.** Add `timelineActivityRuleId`,
`sourceObjectMetadataId` and `action` to `timelineActivity`, populate going
forward, keep writing `name`. Fast instance command.

**Phase 4: rules become metadata.** Add the entity and the pipeline from section 7.
The two standard rules move from the constant into the standard application. The
resolver merges persisted rows onto derived rules. Still no behavior change,
because the merged result equals the previous constant.

**Phase 5: expose read APIs.** Metadata queries and mutations over effective rules,
permission-flagged like other metadata, upserting on the natural key. Validation
lives here: the target field must be one of the three supported shapes, terminal
objects must be timeline-capable (they need a `target<Object>Id` morph column),
field ids must belong to the right object, and the fan-out bound must hold. This is
where frontend work can start.

**Phase 6: new capabilities**, each a deliberate behavior change with its own
decision: default `linkActions` to `[created, deleted]`, let attachments fan out,
add `COUNT` aggregation, add `unlinked` and `emitOnRelationChange`, filter diffs by
permissions server-side.

## 9. Remaining risks

- **Write amplification.** Every enabled rule multiplies inserts by its fan-out. A
  hard `maxFanOutPerEvent` and a per-workspace rule cap are needed before rules are
  user-editable, not after.
- **Permissions.** Fanning a child's changes onto a parent means a reader of the
  parent sees data about the child. Server-side diff filtering should land in the
  same release as the settings UI.
- **Metadata deletion.** Proposal: timeline rows survive (they are workspace data
  and `name` remains self-describing), rules cascade with their source object, and
  a rule whose target field was deleted is deactivated rather than deleted, so the
  failure is visible.
- **Two timeline mechanisms.** Messages and calendar events are read-time,
  everything else is materialized. Whether to unify them under this rule model with
  a `materialization` discriminator is the largest open architectural question, and
  it decides whether the settings UI shows one list or two. It does not block
  phases 0 through 4.
