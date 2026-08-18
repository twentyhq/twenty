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

## 4. Do we need `isTimelineLogged`?

No, and the existence of a row should not be the indicator either. The answer is
the third option: **default rules are derived from metadata and exist without a
row; rows are overrides.** This mirrors how standard metadata already handles
`overrides`.

The three candidates:

**Materialize a row per object.** Object creation gets a side-effect handler
creating a self rule, next to the existing
`object-system-relations-on-create-side-effect-handler`. Uniform ("everything is a
rule"), but it needs a backfill of every object of every workspace, adds a row per
custom object forever, and makes the day-one migration a data migration rather
than a no-op.

**Keep a boolean for self, rows for fan-out.** Simple and no backfill, but the
self rule then cannot carry the knobs we already know we want (field filters,
aggregation), and the settings page has to render two different mechanisms for
one user-facing question.

**Derive defaults, persist only overrides (recommended).** A pure function turns
the object and field metadata into the effective rule set. Rows exist only where
someone changed something.

```ts
computeEffectiveTimelineActivityRules({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatTimelineActivityRuleMaps,
}): Map<sourceObjectMetadataId, EffectiveTimelineActivityRule[]>
```

Derivation, chosen to reproduce today's behavior exactly:

- a **self rule** for every object where `isAuditLogged && !isSystem`, with actions
  `created | updated | deleted | restored`
- no rule for system objects, so `attachment`, `workspaceMember` and
  `workflowVersion` stay silent exactly as the current allowlist makes them
- the note and task **fan-out rules** are not derived. Deriving a rule for every
  junction relation would silently switch on `messageList.members`, which is a
  behavior change. They ship instead as two explicit rows owned by the
  twenty-standard-application, created by the same sync that creates every other
  standard metadata row, so there is no separate backfill command.

Persisted rows are merged onto derived ones by the natural key
`(sourceObjectMetadataId, targetFieldMetadataId)`. A row with `isActive: false`
disables its derived counterpart, which is how you turn a timeline off without a
boolean column. A row with no derived counterpart is a new rule.

Consequences:

- `isTimelineLogged` is never added. `isAuditLogged` keeps its current meaning as
  the master switch for both consumers, because the derivation reads it.
- Zero rows on day one except the two standard fan-out rules, so the migration is
  effectively a no-op and phase 3 below cannot regress behavior.
- The API returns **effective** rules, with `id: string | null` where `null` means
  "derived, not yet persisted". Mutations are an upsert keyed on
  `(sourceObjectMetadataId, targetFieldMetadataId)`, not on `id`, so the frontend
  never has to know whether a rule was materialized. Editing a derived rule
  materializes it.

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

  // created | updated | deleted | restored
  actions: JsonbProperty<TimelineActivityRuleAction[]>;

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

Two rules on the same relation with different morph subsets are therefore not
representable. That is deliberate: `targetObjectMetadataIds` is a filter, not part
of the identity.

### 5.1 Today's behavior as rules

| Rule | source | target field | notes |
| --- | --- | --- | --- |
| self changes | every object with `isAuditLogged && !isSystem` | `null` | derived, no row |
| notes on their targets | `note` | `note.noteTargets` (junction) | standard row; covers `note.*` and `noteTarget.created/deleted` |
| tasks on their targets | `task` | `task.taskTargets` (junction) | standard row; same |

Three concepts replace four hardcoded branches, two of which were duplicates of
each other, and the note/task rows differ from a user-created rule only in who
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
listener are untouched.

The POSITION-field strip becomes a property of the engine rather than of any rule:
no rule should ever emit a position change.

### 5.3 Structured columns on `timelineActivity`

Additive, worth doing early because it removes the string parsing that both the
merge logic and the frontend rely on: `timelineActivityRuleId` (nullable, no FK, so
workspace data does not depend on a metadata delete), `sourceObjectMetadataId`,
`action`. Keep writing `name` in the current format indefinitely. New readers
prefer the columns and fall back to parsing `name`.

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
`groupBy: [TARGET, AUTHOR, LINKED_RECORD, RULE]` is today's behavior and is the
default. `COUNT` is what makes high-volume sources usable ("14 emails received"),
and is the reason messages and calendar events are read-time today. Fixing the
`take: 1` bug is a prerequisite for any of this to work on batches.

The current read-then-merge is racy: two workers can both miss the existing row. A
partial unique index on the group key plus a bucket column
(`floor(happensAt / windowSeconds)`) and `INSERT ... ON CONFLICT DO UPDATE` makes
it correct, at the cost of turning sliding windows into fixed buckets. That is a
visible behavior change and therefore a separate, later step.

**Record-level rollups** (`company.noteCount`) do not belong here. They are
aggregate fields, with different storage and different invalidation (a rollup must
be recomputed on delete, a timeline row must not). They share only the notion of
"watch a related object", so at most they will share the target resolver later.

## 7. Cost of a new metadata entity

Adding `timelineActivityRule` to `ALL_METADATA_NAME` pulls in the full metadata
pipeline. Using `searchFieldMetadata` as the reference implementation, the
checklist is roughly 40 non-generated files:

- entity + module + DTO + exceptions under `metadata-modules/timeline-activity-rule/`
- flat entity type, maps type, map cache service, and the entity/DTO converters
  under `metadata-modules/flat-timeline-activity-rule/`
- registration in `flat-entity/constant/`: `all-metadata-entity-by-metadata-name`,
  `all-entity-properties-configuration-by-metadata-name`,
  `all-many-to-one-metadata-foreign-key`, `all-many-to-one-metadata-relations`,
  `all-one-to-many-metadata-relations`, `all-metadata-serialized-relation`,
  `all-metadata-required-metadata-for-validation`,
  `all-metadata-side-effect-companion-metadata-names`
- universal flat entity type + jsonb serialization constant
- workspace migration: actions type, actions builder service, validator service,
  three action handlers (create/update/delete), the three
  `optimistically-apply-*-action-on-all-flat-entity-maps` utils, the three
  `derive-metadata-events-from-*-action` utils, `metadata-event-to-emit`,
  `compute-ordered-migration-actions`, and the build orchestrator
- twenty-standard-application: the two standard rows and their inclusion in
  `twenty-standard-application-all-flat-entity-maps`
- a fast instance command for the table

This is the dominant cost of the proposal and the main reason to check the shape
before writing code. Nothing here is novel work, but it is not small.

## 8. Phasing

Behavior-preserving through phase 4.

**Phase 0: pin current behavior.** Integration tests covering self changes on a
standard and a custom object, note and task create/update/link/unlink, the POSITION
exclusion, the system-object gate, and the 10-minute merge. This is where finding 1
is confirmed and where we decide whether the refactor reproduces the bug or fixes
it. No production code changes.

**Phase 1: declare the junctions.** Add `junctionTargetFieldUniversalIdentifier` to
`note.noteTargets` and `task.taskTargets`, pointing at the `noteTarget` /
`taskTarget` target morph. Delete the `name === 'note' || 'task'` special case in
`get-is-flat-field-a-junction-relation-field.ts`. Small, independently valuable,
and a prerequisite for phase 2. Needs a workspace command to backfill the setting
on existing workspaces, mirroring
`2-25-workspace-command-...-backfill-message-list-members-junction-target.command.ts`.

**Phase 2: extract the engine, rules in code.** Introduce the rule type, the
resolver, the target resolver and the payload builder. Effective rules come from
the derivation function plus a `STANDARD_TIMELINE_ACTIVITY_RULES` constant holding
the two fan-out rules. Delete the four hardcoded branches. No schema change, no API
change, phase 0 tests unchanged.

**Phase 3: structured columns.** Add `timelineActivityRuleId`,
`sourceObjectMetadataId`, `action` to `timelineActivity`, populate going forward,
keep writing `name`. Fast instance command.

**Phase 4: rules become metadata.** Add the entity and the pipeline from section 7.
The two standard rules move from the constant into the standard application. The
resolver merges persisted rows onto derived rules. Still no behavior change,
because the merged result equals the previous constant.

**Phase 5: expose read APIs.** Metadata queries and mutations over effective rules,
permission-flagged like other metadata. Validation lives here: target field must be
one of the three supported shapes, terminal objects must be timeline-capable (they
need a `target<Object>Id` morph column), field ids must belong to the right object.
This is where frontend work can start.

**Phase 6: new capabilities**, each a deliberate behavior change with its own
decision: let attachments fan out, add `COUNT` aggregation, filter diffs by
permissions server-side, allow disabling a derived self rule.

## 9. Open questions

- **Backfill.** Enabling a rule does not create history. Either "rules apply from
  now on" (what a materialized model implies), or a backfill job, or read-time
  composition for retroactive sources. This should be settled before the frontend
  is designed, because it changes what the UI can promise.
- **Granularity of the user-facing switch.** A single rule on `note.noteTargets`
  fans out to every morph member. `targetObjectMetadataIds` can restrict it, but it
  means the unit of configuration is the relation ("where do note changes show
  up?") rather than the target object ("what shows up in Company's timeline?").
  The second reads more naturally in settings but multiplies rows per custom
  object. Read-time widget config could cover the per-page case instead.
- **Link/unlink as a separate toggle.** Deriving the junction subscription from the
  rule means "show note edits" and "show note links" cannot be toggled apart. If
  they should be, `actions` needs to distinguish source actions from link actions.
- **Changing a many-to-one.** When `contract.companyId` moves from A to B, do both
  timelines get a row (left B / joined A), or only the new value? Today the case
  does not exist.
- **Permissions.** Server-side filtering of diffs by object and field permissions
  should land before rules are user-editable, not after.
- **Metadata deletion.** Proposal: timeline rows survive (they are workspace data
  and `name` remains self-describing), rules cascade with their source object, and
  a rule whose target field was deleted is deactivated rather than deleted, so the
  failure is visible.
- **Two timeline mechanisms.** Messages and calendar events are read-time,
  everything else is materialized. Whether to unify them under the same rule model
  with a `materialization` discriminator is the biggest remaining architectural
  question, and it determines whether the settings UI shows one list or two.
