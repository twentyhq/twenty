# Record permissions and sharing design

Status: Implementation design, 26 October 2026. Product decisions through question 19 and the query-routing decision are incorporated; no product questions remain pending. Sharing and single-record access evaluate authoritative sources through declared inheritance paths; list and batch reads use access materialized on business records. Large policy changes retain the previous active revision until the candidate is ready for atomic publication. The architecture below describes the product artifact to build; implementation and performance acceptance are still pending.

## Purpose and scale

Replace the current mixture of restrictive RLS filters, record-sharing exceptions, and inherited readability with a consistent permission model. Records start private. Object permissions, RLS rules, explicit sharing, and inherited access grant actions. Field restrictions and object record capabilities constrain those grants.

The product artifact covers the permission settings UI, field-based related-record paths, metadata and workspace storage, materialized record access, reliable propagation, and authorization across every record access surface. It must support 10 million records per object, 1,000 workspace members, and approximately 50,000 explicit source shares per workspace. Derived access is not included in the share count. A recomputation affecting 10 million records may take up to 60 minutes. The expected workload is frequent small updates and occasional large permission rebuilds, as confirmed by the user.

The UI follows [Roles and sharing 2.0 in Figma](https://www.figma.com/design/xt8O9mFeLl46C5InWwoMrN/Twenty?node-id=121885-364990). Relevant frames cover role permissions, conditional actions, related records in object settings, and direct versus role-derived access in the sharing panel.

## Agreed product behavior

| Area | Decision |
| --- | --- |
| Default access | Private until an applicable grant allows an action. |
| Combining grants | Object permissions, RLS, sharing, and inheritance are additive. Absence of one grant does not veto another. |
| Explicit sharing | May grant access outside the recipient's ordinary object or RLS grants, subject to Receive eligibility. |
| Field restrictions | Remain restrictive regardless of where record access came from. |
| Record capabilities | Hard limits on operations, declared on `ObjectMetadata`; user and API-role grants cannot override them. |
| Dynamic predicates | Retain current-member predicates, including custom member fields, and maintain derived permission state when inputs change. |
| Materialized identities | Use `accessGroupId`, rather than conflating a rule ID with its many evaluated groups. |
| Query routing | Sharing operations and single-record lookups evaluate live sources and inheritance. List and batch reads use the materialized per-record permissions. |
| Related records | Explicit paths through relation fields, with a maximum of three hops. Inherit all parent record actions, including sharing and deletion, within target capabilities and field restrictions. |
| Sharing authority | Requires a Share grant. A sender cannot delegate actions they do not possess. |
| Creator access | No implicit permanent creator grant. A configured rule such as Created by me can grant access. |
| Existing explicit shares | Persist when their sender subsequently loses access; an authorized actor must revoke them. |
| Large recomputations | Up to 60 minutes for the 10-million-record case. This is not the normal target for an isolated record change. |
| Policy activation | Keep the previous policy active while building and catching up a candidate; activate the candidate atomically once complete. |
| Technical intermediaries | Declared inheritance paths may traverse unreadable intermediate records internally without exposing them. |
| File links | Authorize new link issuance. Revocation of already-issued bearer links and download-time reauthorization are deferred. |
| Sharing-rule scope | Explicit and application-produced source grants; no new criteria-based automatic-sharing editor or rule subsystem. |
| Entitlements | RLS remains enterprise. Preserve the record-sharing entitlement behavior in the codebase. |
| Rollout | RLS and sharing remain independently feature flagged. |

Inheritance grants authority to act on related records. It does not introduce cascading delete or edit commands.

### Deferred work

Application roles exist and may eventually bypass record capabilities through the application-install permission model. That negotiation, its UI, and new application-role bypass behavior are out of scope. Do not introduce a blanket bypass based on an application ID or redesign application role assignment. Existing application and trusted internal behavior needs an explicit compatibility adapter and regression coverage.

The owning application defines record capabilities; workspace administrators cannot loosen them. Redesigning application ownership and install governance is deferred.

Allowing an edit that makes its author lose access is the desired eventual behavior, but changing the current post-update validation is deferred. For this artifact, preserve the existing validation and make its rejection understandable. Do not claim ownership transfer is fixed by the permissions rewrite.

Revoking previously issued file links and reauthorizing their downloads are deferred. New file-link issuance must respect current record and field access; existing links retain their current expiry behavior.

A new criteria-based automatic-sharing editor and its rule-definition storage are out of scope. Preserve existing application/workflow grant producers and their source identities in the workspace `recordShare` table.

## Current foundations

The codebase already contains useful parts of the target architecture:

| Existing component | Current behavior | Required evolution |
| --- | --- | --- |
| RLS predicates and predicate groups | Stored in core metadata, syncable through application manifests and universal identifiers. Compiled against the current member at query time. | Preserve predicate expressiveness and portability; introduce action grants and materialization. |
| Workspace `recordShare` | One cross-object table with role/member/everyone principals and source causes. | Retain the cross-object source-grant model; make delegation, provenance, and recomputation explicit. |
| `buildRowAccessPolicy` | Combines object gates, restrictive RLS, sharing, and inherited access. | Become the common evaluator for additive grants under hard limits. |
| Workspace repository | Applies policies to root and joined aliases and validates writes. | Route point operations to live evaluation and collection reads to projections, preserving join authorization and post-write checks. |
| Inherited readability | Relation-field identifiers, recursive reads, and a depth limit of three. | Compile validated paths for live evaluation and materialized action inheritance. |
| Event authorization | Uses an in-memory evaluation of the shared policy tree. | Keep SQL and event decisions equivalent as storage changes. |
| Transaction events | After-commit callbacks execute in process; failures can be logged and swallowed. | Add durable permission invalidation in the source transaction. |
| Object metadata | `readability` mixes private/inherited/application/system behavior; `writability` covers all non-read operations. | Separate record capabilities from grant sources and UI/schema mutability. |

Source references include [row access policy](packages/twenty-server/src/engine/twenty-orm/utils/build-row-access-policy.util.ts), [workspace repository](packages/twenty-server/src/engine/twenty-orm/repository/workspace-repository.ts), [sharing storage](packages/twenty-server/src/engine/core-modules/record-share/services/record-share-storage.service.ts), [object metadata](packages/twenty-server/src/engine/metadata-modules/object-metadata/object-metadata.entity.ts), and [transaction handling](packages/twenty-server/src/engine/twenty-orm/datasource/workspace-data-source.ts).

## Permission evaluation

Evaluate each action independently. For user and API authority:

```text
record capability permits the action for this authority
AND
at least one eligible grant permits the action on this record
```

Eligible grants come from whole-object permissions, matching RLS rules, explicit shares admitted by Receive, or a configured inheritance path. Apply field restrictions to the requested fields and preserve the existing constraints imposed by additional application or agent authority.

A user role and an application role are not interchangeable additive roles. Preserve the current intersection between authority sources. Resolve grants separately within each applicable authority context; never merge every role into a single union that would expand an application's authority.

Read, update, soft delete, destroy, Share, and Receive require distinct evaluation. Keep the existing create and restore operation mapping explicit in the evaluator rather than silently treating every write as update. Creation has no existing record from which to inherit permissions; its authorization and proposed field values need validation before insertion. It must not produce a permanent creator grant.

### Receive and inheritance examples

Receive admits an explicit source share; it does not grant Read or any other action by itself. Evaluate the recipient's Receive eligibility on the original shared record in the relevant authority context. For a role recipient, evaluate each member's dynamic eligibility rather than admitting the entire role unconditionally.

Inheritance carries the granting parent's effective actions to the target, within the target's capabilities and field restrictions. An absent target-object Receive grant is not a prohibition on an independent inheritance grant. This follows the agreed additive model and the requirement to inherit all parent actions. A technical record used only to connect two ends of a declared path is not an additional granting parent.

| Situation | Required result |
| --- | --- |
| Alice has Receive on a company and is explicitly given Read, but has no company Read rule. | The share grants company Read. |
| Alice is named in a company share but has no applicable Receive grant there. | That share contributes no actions; independent object, RLS, or inherited grants may still apply. |
| Alice can read a company, and a declared path carries company access to messages. | Alice inherits message Read within message capabilities and field restrictions; no separate message Receive grant is required. |
| The company-to-message path crosses an unreadable message participant. | The internal relation lookup may proceed; it does not grant access to the participant or its fields. |
| The message object forbids editing, while Alice can edit the company. | Alice cannot edit the message. Another grant cannot override its capability. |
| Alice has Receive without Read, an applicable share, or another Read grant. | Alice cannot read the record. |

Use these cases for both live and projected evaluator tests. Preserve creation as a separate operation with the current create and proposed-value checks; do not add a parent-conditioned creation editor or infer child creation authority from a parent's existing record actions.

### Record capabilities

Use record capabilities to describe what operations an object supports for user/API access. The metadata must distinguish reading, creating, editing, soft deletion, and destruction; sharing also needs an explicit capability check where it is available. A capability makes an operation eligible for permission grants. It does not open records by itself.

Evaluate capabilities before granting access through materialized groups or explicit shares. In particular, stale materialized access must not override a capability prohibition. Child objects retain their own capability limits when they inherit parent actions.

An application-managed invoice object can expose readable records while preventing user/API edits and destruction. The permission UI should show the reason, such as Managed by Stripe, rather than presenting a toggle that cannot take effect. The term application-managed is proposed; `record capabilities` is agreed.

Do not reuse `isSystem` as a general permission switch. It also participates in schema protection and visibility. Likewise, `isUIEditable` and `isUICreatable` control UI behavior and cannot substitute for server authorization. Preserve existing actor-specific `APPLICATION` and `SYSTEM` behavior during migration without adding the deferred application-role bypass model.

### Field restrictions

Record access does not imply access to every field. Validate selected and mutated fields, relation payloads, exports, event payloads, filtering, ordering, grouping, and aggregation. Reject operations that would disclose restricted fields through a query operation instead of silently stripping fields only from the final response.

The capability and field checks are required regardless of whether access comes from an object grant, a dynamic rule, a share, or inheritance.

## Access groups

An RLS rule is a portable definition. An access group identifies the principals that share one evaluated form of that definition within a workspace.

| Rule | Example group | Membership |
| --- | --- | --- |
| Sales may read all companies | Sales for this grant revision | Principals with the applicable Sales role. |
| Sales may read companies where region is my region | Sales and region France for this rule revision | Sales members whose current region is France. |
| Sales may edit companies where owner is me | Sales and member Alice for this rule revision | Alice while she has the applicable role. |

A group is bound to its role, rule, and relevant current-member values. A group for France must not accidentally grant every French member access regardless of role. Distinct rules and active revisions must remain distinguishable even when their current member sets happen to match.

For each conditional rule, group members with identical values of the member fields used by that rule. Missing required member values produce no matching grant. API contexts without a member do not acquire current-user grants through fabricated member values.

Resolve a viewer's group IDs once per authorization context and reuse that context across the query. Cache it by workspace, principal, authority source, active policy revision, role assignment version, and relevant member-data version. A role or member-field change invalidates membership even if no business record changed.

Moving a member between already-materialized groups usually changes group membership rather than every record. A previously unseen binding requires a new group and backfill before that group can grant access. Groups can therefore have building, ready, and retired lifecycle states; a building group must not be mistaken for complete authorization state.

### Cardinality limits of the representation

Grouping compresses common owner and region rules, but does not guarantee small arrays for every predicate. For example, 1,000 distinct member thresholds can produce 1,000 matching bindings on a record. With 10 million records, a single column containing 1,000 UUIDs per row has 160 GB of raw UUID payload before row/index overhead and compression.

Measure group count per rule, group memberships per principal, and identifiers per record/action. The implementation must not silently truncate a permission set. High-cardinality predicates require a measured representation or exact evaluation strategy before the artifact can claim support for the full workload. Arbitrary new product limits or changes to supported RLS predicates require an explicit design decision.

## Storage

Keep definitions that can travel between staging and production in metadata. Keep instance-specific sharing and derived state in the workspace schema. Local database IDs and member values must not be exported as portable policy definitions.

| Location | Data | Purpose |
| --- | --- | --- |
| Core metadata | RLS grant definitions, actions, predicate groups, field references, role references, universal identifiers | Portable policy source of truth. |
| Core metadata | Related-record path definitions and record capabilities on or linked to `ObjectMetadata` | Portable object behavior. |
| Workspace | `recordShare` source grants and record-sharing rule configuration | Workspace data and principal references. |
| Workspace | Access groups and membership state | Derived, rebuildable bindings of policy definitions to local principals. |
| Workspace | Permission revisions, recomputation jobs, cursors, and durable invalidations | Activation and recovery. |
| Workspace business records | Derived per-record/action access groups and projection version information | Fast list/batch authorization, subject to performance acceptance. |

The artifact uses columns named `readableByAccessGroupIds`, `writableByAccessGroupIds`, `softDeletableByAccessGroupIds`, `destroyableByAccessGroupIds`, `shareableByAccessGroupIds`, and `receivableByAccessGroupIds` for derived access. The measured alternatives place these in a separate permission row per record, or use one row per record/group with an action representation. Final names must follow the existing action vocabulary. Empty sets grant nothing. Missing or unfinished projection state must never mean unrestricted access.

All representations are internal state. Public mutations, imports, workflows, and application writes cannot set them directly. Exclude them from normal exports, user filters, and field settings. Internal projection updates must not create ordinary record-change notifications, timeline activity, modification timestamps, or recomputation loops.

### Write costs of on-record access groups

The confirmed workload makes on-record access groups a credible preferred candidate: read-side work is frequent, while broad permission rewrites can be scheduled and budgeted. Size the write workload by the number of records whose effective access changes, including descendants. A small source edit with millions of descendants belongs in the large-rebuild lane.

Start with one GIN index on readable access groups for collection queries. Other action arrays support the derived model and collection-level work, but do not replace live authorization of specific record mutations. Add an action index only when measured query patterns need it. Six action columns do not imply six GIN indexes, and one recomputation should update all changed actions in one row update.

Changing a GIN-indexed access column prevents PostgreSQL's HOT optimization. The new heap tuple also requires index maintenance beyond the access index, leaving old versions for cleanup. Lowering fillfactor alone cannot restore HOT eligibility when an indexed value changes. Unchanged out-of-line business values can normally be reused, so this does not imply rewriting every large text value. See [HOT updates](https://www.postgresql.org/docs/15/storage-hot.html) and [TOAST updates](https://www.postgresql.org/docs/15/storage-toast.html).

GIN's pending list amortizes index insertion work, but reads must inspect it and a foreground update can trigger expensive cleanup. Track pending-list size and cleanup latency, and measure table-specific autovacuum settings and background cleanup. A short batch is not a guarantee of a short execution time. See [GIN implementation](https://www.postgresql.org/docs/15/gin-implementation.html).

Keep group membership separate from per-record group IDs. Moving a member between existing ready groups can avoid a table rewrite; adding a new binding or changing which records match a group still requires materialization. Canonicalize the calculated sets and skip unchanged rows. Workers need short lock budgets and durable retries for rows being edited, with generation checks that prevent stale computed permissions from overwriting newer work.

On-record updates trade extra WAL, reusable dead space, cache pressure, and business-row lock contention for simpler read-side checks and same-table index combinations. A separate projection table isolates the heap and row locks, but its indexes, vacuum, CPU, and I/O still share the database. Neither placement removes the need for tenant admission and background-work budgets.

### Object columns versus separate access tables

A separate table does not require joining every business record for each page. With an index on `(city, createdAt, id)`, PostgreSQL can visit companies in the requested city and order, probe an indexed permission table, and stop after finding the requested number of authorized records. When access is sparse, it can instead find accessible record IDs through an access-group index, look up those records, apply the city filter, and sort the survivors. Use `EXISTS` or a deduplicated candidate set so overlapping groups cannot duplicate records or distort pagination. Authorization must be applied before the page limit.

| Layout | Read tradeoff | Write and storage tradeoff |
| --- | --- | --- |
| Access arrays on each business record | Cheap candidate checks; GIN can combine with business-field indexes on the same table. | Permission recomputations rewrite business rows and maintain their indexes; business rows contain permission payloads. |
| Separate permission row per record, with action arrays | Additional lookup for each business candidate, or GIN-selected permission candidates followed by business lookups. | Isolates permission updates from business rows; still has array and GIN maintenance costs. |
| Separate record/group rows with action data | Composite B-tree indexes support both record-to-group probes and group-to-record candidates. | Cardinality follows effective record/group/action associations, not the 50K source-share limit; duplicated record IDs and index entries can be substantial. |

Separate-table candidates need efficient lookup in both useful directions. A per-object table can use `recordId`; a shared table also needs `objectMetadataId` in its identity and lookup indexes. Per-object tables or object partitions may improve statistics and lifecycle management. The local read comparison covers one object and one action; it does not settle cross-object partitioning or action encoding.

Sparse access, skew, missing filter/sort indexes, large offsets, and exact counts remain difficult with every layout. Arrays on the business row allow bitmap intersection across access and city, but bitmap scans lose ordering and may still need to inspect and sort a large candidate set. Keyset pagination avoids repeatedly skipping earlier pages; it does not remove the cost of finding authorized candidates. See PostgreSQL's [join and LIMIT examples](https://www.postgresql.org/docs/15/using-explain.html) and [index ordering documentation](https://www.postgresql.org/docs/15/indexes-ordering.html).

Use on-record arrays for list and batch reads as selected in the query-routing decision. Keep normalized rules and source shares authoritative for live evaluation and recomputation. This decision does not establish performance acceptance: the durable-write experiment exposed long-tail failures under an unrestricted worker, while a short rate-limited run completed successfully. Revisit the layout if representative group cardinalities or write workloads cannot meet the acceptance criteria with bounded resource usage. Separate storage remains a measured alternative; on-record storage is not required for correct pagination.

The first comparison demonstrates fast cases for both separate-table layouts; it does not establish acceptable worst-case performance. Selecting authorized IDs before fetching full records materially improves one sparse filtered case, but causes a severe regression when all accessible records are at the oldest end of the sort order. Do not apply that rewrite universally. Validate business-first and access-first plans, sparse candidate materialization, generic prepared plans, and skew before selecting the query compiler strategy.

### Evidence from other systems and worst-case requirements

Salesforce documents Object Sharing tables, generally associated with each object, plus Group Maintenance tables. Read queries join records, sharing rows, and group membership. This is a conceptual public architecture, not an exhaustive physical schema or a latency guarantee. See [Record-Level Access database architecture](https://developer.salesforce.com/docs/platform/salesforce-record-access-under-the-hood/guide/uth-arch.html). Its [record access calculation documentation](https://developer.salesforce.com/docs/platform/salesforce-record-access-under-the-hood/guide/uth-determination.html) describes persisting computed access rather than evaluating the full sharing model at every read.

Salesforce also documents tenant-, group-, and user-level visibility statistics, runtime pre-queries, and query construction that selects different access paths for the same logical request. Its query optimizer influences the driving table and sharing join order. Separate storage is therefore supported by substantial query-planning infrastructure. See [multitenant query processing](https://architect.salesforce.com/docs/architect/fundamentals/guide/platform-multitenant-architecture.html) and the [Lightning Platform query optimizer](https://developer.salesforce.com/docs/platform/salesforce-large-data-volumes-bp/guide/ldv-deployments-infrastructure-salesforce-query-optimizer.html).

Salesforce's engineering guidance explicitly warns that an ordered index scan may examine many records when matching records are far from the start of the scan. The [sort optimization article](https://developer.salesforce.com/blogs/engineering/2014/03/force-com-soql-best-practice-sort-optimization) is from 2014; it illustrates this enduring failure mode rather than documenting all current engine internals. No reviewed source establishes a fast worst-case bound for arbitrary filters, sorting, and sharing distributions.

Microsoft Dataverse stores record-sharing permissions, including cascaded access, in a separate PrincipalObjectAccess table. Microsoft documents management of its growth and recommends team-based sharing for repeated recipient sets. See [PrincipalObjectAccess storage](https://learn.microsoft.com/en-us/power-platform/admin/manage-principalobjectaccess-storage). AuthZed's SpiceDB guidance offers accessible-ID lookup, checking candidate pages, or materialized permissions joined locally, depending on workload. See [protecting a list endpoint](https://authzed.com/docs/spicedb/modeling/protecting-a-list-endpoint). Neither is evidence that authorization plus arbitrary business filtering and sorting becomes uniformly cheap.

Storing access-group IDs alongside content is also an established read-model pattern. Azure AI Search documents a filterable `group_ids` collection on each document and intersects it with the caller's groups in queries. This demonstrates the pattern, not PostgreSQL transactional performance. See [Azure security filters](https://learn.microsoft.com/en-us/azure/search/search-security-trimming-for-azure-search).

Our architectural inference is that normalized sharing tables are attractive for independent grant updates, audit/provenance, relational constraints, and highly variable recipient sets, while on-record projections trade more write work for read efficiency. The reviewed sources do not establish why Salesforce historically selected its physical layout. Twenty can retain normalized rule/share sources while materializing a different read representation; the choices need not be identical.

For this artifact, use on-record arrays for collection reads and as the performance baseline, subject to the requirements below. These are proposed engineering requirements, not claims about competitor internals:

- Treat the observed 4.8-second, nearly 10M-probe plan as an unresolved failure, regardless of faster median cases.
- When the accessible set is small, evaluate a query form that explicitly materializes that set before business filtering and sorting. Validate the actual execution plan; SQL clause order alone does not constrain the optimizer.
- Evaluate an ordered business-candidate path for broad access and selective business filters. Use permission cardinality estimates only to choose a plan, never to grant access or omit required checks.
- Measure a work-limited ordered-scan strategy with an exact bulk-intersection fallback for skew. Such a strategy must preserve order, page completeness, and the policy revision; it is not yet implemented or benchmarked. A timeout alone does not satisfy the latency target.
- Include zero-overlap sets, access confined to either end of every supported sort, large overlapping groups, stale statistics, prepared generic plans, cold reads, and concurrent updates in the acceptance matrix. Report examined candidates and buffer work as well as p95/p99 latency.

Neither storage layout alone provides a fixed latency bound for every arbitrary filter and sort. Stronger guarantees may require additional maintained access/filter/sort indexes or a defined set of indexed query patterns. Those costs and any product constraints must be explicit before implementation is approved as performant.

### Explicit shares

Keep one cross-object source-grant table. At 50K source grants, splitting it into per-object tables would add schema overhead without addressing the larger cost of inherited access.

The storage model distinguishes authoritative source grants and inheritance definitions from derived effects:

| Data | Placement | Cardinality |
| --- | --- | --- |
| Original manual or application-issued record grants | One cross-object workspace `recordShare` table | Approximately 50K source grants under the agreed workload. |
| Inheritance path definitions | Portable object metadata referring to relation fields | One definition per configured path, at most three hops. |
| Effective access from direct shares, inheritance, and RLS | Action access-group columns on each affected business record | Follows affected records and groups; no descendant rows in `recordShare`. |

Sharing and single-record operations query original shares and declared inheritance paths directly, with Receive eligibility and the other permission limits applied. List and batch reads use the materialized action sets, including the effects of direct shares. The earlier direct-share OR subquery on each collection query is superseded by this decision. Keep `recordShare` as the source of truth and source of provenance; do not create descendant grant rows.

A share change invalidates the original target's projection as well as its descendants. Update the target projection in the source transaction when the bounded computation is cheap; otherwise enqueue it with interactive priority. Shared-role recipient groups must not grant access to members who fail Receive. Materialization and group membership must preserve recipient and Receive eligibility within each authority context; raw union of recipient IDs is insufficient.

For example, one company share affecting 100K related records remains one source grant plus updates to the affected records' derived columns. A descendant's independent direct share remains a separate source grant. The inheritance worker uses the parent's effective allowed actions, including applicable Receive and capability checks, when calculating what propagates.

Do not initially add a persistent table with one row per inherited record and originating share. Such a provenance table would help trace contributions and some incremental removals, but would duplicate a potentially large relation and add write, index, and reconciliation work. Keep source identities in the grant table, derive explanations through indexed paths when requested, and preserve old relation endpoints in durable invalidations. Reconsider a narrowly scoped provenance index only if measured recomputation or explanation workloads justify it. Group and membership tables, audit history, and the durable work queue are separate concerns; this decision concerns per-descendant sharing rows.

A source grant needs the target object and record, recipient principal, permitted actions, source identity/cause, and grantor/audit information. Use existing `recordShare` structures where they can express this correctly. Index both recipient-to-record lookup and record-to-grant lookup. Keep distinct source identities so removing a manual share does not remove an application grant to the same recipient.

Do not create one `recordShare` row for every descendant. Materialize inherited access in the business record's action columns. Recompute effective access from the remaining sources when a source is removed; removing one grant must not erase another grant that still applies. A source-grant ID is not automatically an access-group ID: recipient membership groups can be reused across grants while provenance stays distinct in the source table. Removing a grant must not blindly remove a recipient group that another source still supplies.

On share creation or expansion, evaluate the sender's actions, Share authorization, delegated level, and target capabilities from authoritative sources within the transaction, including applicable inherited grants. Stale projected actions cannot authorize delegation. Preserve the existing record/advisory-lock discipline and cover mutable ancestor and policy inputs in the transaction-consistency design; a lock on the target alone does not freeze those inputs. Existing shares still survive their grantor's later loss of access.

Record who issued the grant, but do not make an existing share continuously depend on that person's later role, ownership, or access. Their later loss of access does not revoke the share.

Record-sharing scope includes explicit grants and existing application-produced grants. Retain their workspace storage and source identities. Do not introduce a generic criteria-based sharing-rule table or editor for this artifact.

## Related records

Store paths using relation-field universal identifiers, direction, and the resolved source/target objects. A display label such as People is insufficient because an object can have several relations to the same object type. Validate each hop against relation metadata, including morph targets and junction objects.

The intended example is:

```text
company --people relation--> person
        --message participant relation--> messageParticipant
        --message relation--> message
```

The maximum is three relation hops from the granting record to the target. Do not allow several shorter configurations to silently compose into an unbounded traversal. Reject invalid or cyclic definitions that defeat that bound. Compile a dependency map so workers know which target objects and paths a field change can affect.

Because grants are additive, access from any valid parent can grant an action, and an independent child grant can also grant it. Removing one parent must preserve grants from other parents and direct sources. A detached record has no inherited grant and falls back to its other configured grants; it is not automatically public.

Propagate all parent record actions. Each target's record capabilities and field restrictions remain effective. If an intermediate record is itself the granting parent for a later edge, use its effective allowed actions, not an uncapped raw array. Permissions to act do not execute actions or introduce data-deletion cascades.

Internal traversal through an unreadable technical junction object is allowed. A declared multi-hop path may inspect relation keys internally without exposing the intermediate records or their fields. It still enforces the original granting record's effective action policy and the final object's capabilities and field restrictions. A junction used only as a path segment is not itself a granting parent whose Read capability would veto traversal. This distinction matters for message participants and similar application-managed objects; it does not authorize arbitrary traversal of undeclared paths or disclosure in access explanations.

Relation additions, removals, retargeting, soft deletion, restore, and destruction all invalidate affected projections. Preserve existing trash semantics deliberately and test them; a deleted relation must not leave permanent inherited access.

## Propagation and reconciliation

### Source transactions

Persist a permission invalidation in the same database transaction as each relevant source change. A Redis enqueue or an in-process after-commit callback is not the durable source of truth. Metadata changes and workspace changes need adapters that participate in their actual transaction; writing an outbox entry on an unrelated connection does not satisfy this requirement.

Relevant changes include business-record predicate fields, member attributes, role assignments, rules, object capabilities, relation metadata, relation endpoints, and source grants. If existing predicates can depend on time, time boundaries also need scheduled invalidation rather than waiting for a data edit.

Capture the old and new relation endpoints needed to retract access. Destructive changes can remove the links needed to discover affected records later. Capture a bounded affected frontier before deletion where possible; otherwise schedule a conservative target-object rebuild. Never drop an invalidation merely because the old path can no longer be joined.

For newly created records, calculate the directly available projection before returning readable data where feasible. Otherwise keep the record private until its projection is ready. Propagation to large sets of descendants remains asynchronous. Single-record work must not wait behind a full-table rebuild for the same workspace.

### Worker behavior

Use the existing queue infrastructure to dispatch durable work, with a database-backed lease, retry state, and requested generation. Coalesce repeated invalidations, but retain enough old/new relation information to handle deletions.

Workers recompute the current effective set from authoritative sources instead of applying blind add/remove deltas. Overlapping sources then remain correct after retries or revocations. Canonicalize and deduplicate access sets, and skip writes when the result is unchanged.

Reject obsolete work using policy revision and requested generation. A slow job must not overwrite the result of a newer invalidation. Source changes arriving during a computation must leave durable pending work after that computation commits. Worker crashes, duplicate delivery, and lease expiry must be harmless.

Traverse indexed paths in bounded batches. Use keyset cursors rather than growing offsets, bounded concurrency per workspace, and a separate lane for interactive changes. The three-hop limit bounds depth, not fanout: one source change can still touch millions of rows.

### Cron reconciliation

Cron checks stranded invalidations, expired leases, unfinished revisions, and projection drift. Walk objects using resumable cursors and bounded time budgets; do not load a workspace into memory or issue an unconditional 10M-row rewrite every few minutes.

Use periodic authoritative recomputation in partitions to detect missed source invalidations. The event path is the normal route; reconciliation supplies recovery. Report queue age, oldest unapplied invalidation, mismatch count, rows examined/updated, retry counts, and activation progress.

### Large policy activation

Keep the active policy serving requests while a candidate revision is materialized, then switch the active revision atomically after catch-up and validation. This is the confirmed publication model. The UI must distinguish the active policy from a candidate that is Applying or Failed; completing a scan alone is not sufficient to mark the candidate active.

Namespace generated group IDs by the relevant grant revision. A record's permission projection can temporarily retain active and candidate group IDs in its action arrays. Viewers resolve only groups for their pinned active revision. Candidate groups cannot grant early access merely because a batch has populated them.

Catch up mutations occurring during the scan before activation. A monotonically allocated event number alone is not proof that all earlier transactions committed: define the transaction fence and unfinished-work check explicitly. An activation transaction must not publish a candidate with an unprocessed gap. Pin the active revision for a request and version all caches accordingly.

Use a transaction-scoped workspace publication fence for the artifact. Relevant source writers and projection workers acquire it in shared mode before reading revision state or changing permission inputs; publication acquires it exclusively. At publication, the exclusive fence waits for earlier participating transactions to finish and prevents new ones from passing the check. In a fresh database snapshot, verify that the candidate scan is complete and that no committed candidate invalidation or unfinished generation remains, then switch the active revision in the same transaction. If work remains, release the fence and continue catch-up; never perform a large drain while holding it. Bound lock acquisition and publication duration so ordinary writes do not queue behind an unbounded activation attempt. Acquire multiple workspace fences in deterministic order when necessary.

This protocol depends on every permission-relevant writer participating, including metadata changes and internal writers. Audit those paths and test a writer paused before commit, a worker paused before projection commit, concurrent activation attempts, and a source transaction that starts after the revision switch. The fence is an implementation design, not an already verified guarantee.

Keep old revision data long enough for in-flight requests and rollback, then clean it in batches. Measure temporary storage, WAL, and index growth while two revisions coexist. A failed or cancelled candidate leaves the old active policy usable.

This revision mechanism applies to policy publication, not every routine source change. Ordinary data changes still follow the accepted eventual-consistency model. The exact ordinary-change target remains to be measured; 60 minutes is the accepted large-case budget.

## Read and write paths

Compile one permission model into two execution strategies. Live evaluation reads the active policy, member/role inputs, original shares, and declared relation paths. Materialized evaluation checks the current authority's eligible access groups against the record's derived action columns. Whole-object grants can use a fast path in either strategy when the same capability, field, and authority constraints hold.

### Query routing and consistency

| Operation | Evaluation |
| --- | --- |
| Sharing panel and access explanation for one record | Live source lookup and declared inheritance paths, with sanitized provenance. |
| Create, expand, or revoke a share | Live transactional authorization of the relevant actions and delegation bounds. |
| Single-record lookup by ID or another unique indexed key | Live SQL evaluation of direct grants, applicable RLS predicates, and inheritance. |
| Lists, searches, multi-record fetches, collection relations, counts, aggregates, and exports | Materialized permissions on the queried records, applied before filtering results into a page or aggregate. |
| Single-record edits, deletion, and other mutations | Transactionally check current source-derived action permissions and retain the existing post-update validation. |
| Bulk mutations | Use projections to select candidates, then perform live action validation for each bounded target batch in SQL within the mutation transaction. |

The first four routes implement the user's query-routing decision. The mutation routes extend the same freshness principle to state-changing actions. They must not devolve into one database round trip per record.

Route by the operation's declared scope, not the number of rows returned. A filtered collection query with `LIMIT 1` remains a collection query; it cannot use an unbounded live inheritance scan to find its first permitted result. A detail query can use live authorization for its root while a nested collection uses materialized authorization for each returned child. Do not convert a large batch of IDs into a loop of live point checks.

Live single-record evaluation starts with the target's unique indexed identity and traverses only declared paths, at most three hops. It evaluates authoritative inputs at every applicable source; reading an ancestor's stale access array would break the live contract. Depth limits do not bound ancestor fanout. Keep server deadlines, indexed reverse relations, and request/tenant admission limits on live queries too; no expensive-query fallback may silently grant from a stale projection.

A live authorization decision and its protected record fetch must use the same database snapshot, preferably as one SQL statement. Use the primary database or an explicitly freshness-fenced source; lagging replicas and unversioned caches cannot satisfy the live route. Version any cached policy/member/role inputs against the active source state. Sharing mutations need transactional authorization and a concurrency design for the relevant mutable inputs. No freshness guarantee is established merely by doing a separate check before fetching or mutating a record.

Both routes enforce record capabilities, field restrictions, Receive, active-policy selection, and the existing intersection of user/API/application/agent authority. Shares remain additive grants subject to Receive; their eligible effect is included in the materialized action sets. In particular, a role-targeted share cannot grant every member if only some members satisfy Receive. Keep recipient and dynamic member bindings distinguishable in compiled group membership and projection computation.

Materialized collections remain eventually consistent under the accepted propagation delay. After a source revocation, a list may still return the record and selected fields while live detail/sharing access already denies it. After a grant, a live detail lookup may succeed before the record appears in lists, searches, or counts. New sharing decisions must use live authority, so a stale list cannot let a user delegate revoked actions. Do not silently add per-result live filtering to lists: it would change their cost and could break page/count completeness. If immediate revocation of collection content becomes required, this consistency contract must be revised.

Both strategies pin the same active policy revision. A candidate revision must not grant through the live compiler before atomic activation makes it active for the workspace. Ordinary source-data changes retain the live-versus-eventual distinction above. Once invalidations are drained for a pinned revision and source snapshot, live and projected authorization must agree for every tested record, action, and authority context.

Apply the selected policy predicate inside the database before pagination, counting, aggregation, or mutation. Authorize each joined alias and relation expansion according to its scope. For projected array checks, use the appropriate GIN operators alongside primary-key and sort/filter indexes. Bitmap combinations can lose index ordering and require sorting; large arrays increase maintenance work. See [index types](https://www.postgresql.org/docs/15/indexes-types.html), [bitmap scans](https://www.postgresql.org/docs/15/indexes-bitmap-scans.html), and [GIN maintenance](https://www.postgresql.org/docs/15/gin-implementation.html).

### Three-hop sharing query shapes

Consider a company shared with Alice and a declared company → person → messageParticipant → message path. The source table contains the company grant. Live access resolves that path from a selected message. Workers materialize its eligible effect on the message for collection reads.

The following illustrative collection SQL uses proposed column names and named bind placeholders. It shows one authority context without a whole-object read grant. The compiler also enforces capability/field checks and the intersection of authority contexts. Viewer groups come from the server's authorization context. The readable set includes eligible direct shares, inherited shares, and RLS grants.

```sql
SELECT message.id, message.subject
FROM message
WHERE message."deletedAt" IS NULL
  AND message."readableByAccessGroupIds" && :readGroupIds::uuid[]
  AND (message."createdAt", message.id) < (:cursorCreatedAt, :cursorId)
ORDER BY message."createdAt" DESC, message.id DESC
LIMIT 50;
```

Add requested business filters before pagination and omit the cursor predicate for the first page. There is no source-share branch or ancestor traversal in this collection example. This query shape still needs plan validation under skew; storing access locally does not establish a latency bound.

For live evaluation or an access explanation, this reverse lookup retrieves candidate company-source grants for one selected message:

```sql
SELECT DISTINCT
  share.id AS "sourceShareId",
  share."principalType",
  share."principalId",
  share.actions
FROM message
JOIN "messageParticipant" AS participant
  ON participant."messageId" = message.id
JOIN person ON person.id = participant."personId"
JOIN company ON company.id = person."companyId"
JOIN "recordShare" AS share
  ON share."objectMetadataId" = :companyObjectMetadataId
 AND share."recordId" = company.id
WHERE message.id = :messageId;
```

This is a candidate-origin query for one path, not the complete authorization predicate. A live record query embeds compiled direct and inherited grant branches as SQL predicates on the uniquely identified target. Apply Receive, capabilities, active-record/trash semantics, relevant RLS predicates, and other valid paths before deciding access. A sharing explanation can return permitted source details; it must not expose inaccessible ancestors or fields. Sharing operations use these authoritative sources even when the message's projection has not caught up.

When a company grant changes, discover descendants through indexed relation pages. First walk people with `companyId = :companyId AND id > :personCursor ORDER BY id LIMIT :batchSize`; then walk participants for each person with `personId = :personId AND id > :participantCursor ORDER BY id LIMIT :batchSize`. Participant rows supply the message IDs. Persist both cursors, deduplicate target invalidations, and update messages in bounded batches. A final LIMIT on a three-hop DISTINCT join would not bound traversal or sorting work.

Workers recompute eligible contributions from every relevant source and write canonical action sets. Removing a company share does not blindly subtract a recipient group that another source still supplies. Retain old relation endpoints in durable invalidations so detached descendants are also recomputed.

Relevant indexes include `person(companyId, id)`, `messageParticipant(personId, id)`, a reverse `messageParticipant(messageId, personId)` lookup, source grants by `(objectMetadataId, recordId)`, and recipient lookup by `(principalType, principalId, objectMetadataId, recordId)`, alongside message primary-key/access/order indexes. Derive actual names and indexes from relation metadata. A target batch bounds write count, not all ancestor work; high-fanout live and worker traversal still needs budgets and measurement.

The authorization coverage matrix must include:

| Surface | Required behavior |
| --- | --- |
| GraphQL and REST | Use the same policy semantics with explicit live point/sharing routes and projected collection routes, including relations, bulk IDs, counts, aggregation, and grouping. |
| Search and duplicate lookup | No record or restricted-field disclosure through alternate retrieval paths. |
| Exports | Capture and revalidate the requester's authority during paged work; secure the resulting artifact. |
| Events and subscriptions | Apply row and field authorization before delivering payloads; keep evaluator results consistent with SQL. |
| Workflows, agents, and logic functions | Preserve their caller/application/agent authority constraints. Audit explicit internal bypasses. |
| Files | Authorize new file-link issuance from the related record/field. Revocation of existing bearer links and download-time reauthorization are out of scope. |
| Trash and restore | Apply the corresponding action policy and explicit deleted-relation semantics. |
| Internal writers | Imports, sync, migration, and raw SQL must update projections or emit durable invalidation; public writers cannot set derived permission state. |

The current update-after-write RLS validation remains in place for this artifact. This compatibility restriction is separate from the new additive authorization model and should be covered by an explicit regression test.

## Permission UI

Role settings show defaults for all objects and per-object cards. Each card separates All records from Some records and exposes action-specific grants. Conditions and field restrictions must remain visually distinct: conditions grant access to records, while field restrictions limit usable fields.

Object settings expose Related records through a field-path picker. Show every field hop, direction, and target object, validate the three-hop limit, and explain that parent actions propagate subject to the target's capabilities. Technical junction objects must be representable even when they are hidden from normal record navigation.

The sharing panel separates direct shares from role and inherited access. Show the permitted access levels, disable levels the sender cannot delegate, and explain the limiting capability when appropriate. Removing a direct share should show whether the recipient still has access through another source.

For policy edits, show the active policy separately from a candidate that is Applying or Failed. Progress should reflect processed work and backlog, not a fictitious percentage computed from an unknown fanout. Keep the last active revision inspectable while a candidate is being applied.

Provide an Explain access view for a selected record/member/action. It should identify applicable rule/group, direct share, or inheritance path and the hard limit that blocks an action. Compute detailed provenance on demand from definitions and source grants; do not duplicate every inheritance edge solely to power this UI. Sanitize explanations so they do not reveal records or fields the viewer cannot inspect.

Use existing Twenty components, canonical icons, Lingui strings, and Linaria styles. Match the Figma interactions while retaining accessible keyboard, loading, empty, error, and disabled states.

## Performance evidence and remaining gates

The initial local dataset contains 10 million records and 50K source shares in an isolated PostgreSQL 15.14 database on Apple silicon, with 128 MB shared buffers and 4 MB work memory. Records and indexes occupy approximately 1,934 MB; shares and indexes approximately 11 MB. Two serial SQL runs do not establish production p95 or concurrent throughput.

| Query | Second execution time |
| --- | ---: |
| Unrestricted latest 50 | 0.050 ms |
| Role matching 50 percent, latest 50 | 0.071 ms |
| Role dispersed across 0.1 percent, latest 50 | 19.421 ms |
| Role matching the oldest 1,000 records, latest 50 | 0.321 ms |
| Shared-only candidate set, latest 50 | 5.056 ms |
| Role OR correlated share formulation | 327.099 ms |
| Role OR uncorrelated share candidate formulation | 10.696 ms |
| Exact count for the 50 percent role | 568.834 ms |

The two share formulations returned identical top-50 IDs in this scenario. Current named-grant code already uses an uncorrelated candidate form; this comparison is a query-design warning, not evidence of that particular regression in current production code.

A separate temporary-table comparison used 100K records, 1,000 members, ten regions, and 100 eligible members per record. Expanded member arrays and their GIN index occupied 229,449,728 bytes, versus 7,929,856 bytes for one regional access-group ID per record. Both returned 10K records for the selected member's region. This is a storage comparison for a compressible regional rule, not a durable-write or arbitrary-predicate benchmark.

### Separate derived-access tables

A further comparison adds a city to each of the 10M records, distributed across 100 cities using a hash independent of the modulo-based access assignment. The selected city contains 100,205 records. The dense group can read 50,182 of them; the dispersed group can read 98. Queries select the same fields, apply authorization before limiting, and order by `createdAt DESC, id DESC`.

The three layouts use the same company heap to isolate authorization lookup differences: arrays on that heap, a separate row per record containing its access array, and separate `(recordId, accessGroupId)` rows. The company table has city/order, global order, primary-key, and GIN access indexes. The separate array table has primary-key and GIN indexes; the normalized table has composite indexes in both directions. These are per-object, single-action prototypes, without revision or audit columns.

Median execution times from three repeated serial runs, after a result-equivalence query:

| Direct query | On company | Separate array row | Separate record/group rows |
| --- | ---: | ---: | ---: |
| City filter, 50% overall access, latest 50 | 0.283 ms | 0.903 ms | 0.727 ms |
| City filter, 0.1% dispersed overall access, latest 50 | 17.274 ms | 77.164 ms | 128.122 ms |
| City filter, only oldest 1,000 accessible, returns 13 | 0.288 ms | 1.261 ms | 2.522 ms |
| No city filter, only oldest 1,000 accessible, latest 50 | 0.402 ms | 1.277 ms | 2.694 ms |

For the dense city case, both separate-table plans read 97 company candidates and perform 97 permission probes to return 50 records. For the dispersed city case, the direct separate-table queries start from 10,000 permission candidates, look up their companies, and retain 98 before limiting. Neither joins all 10M companies in these plans.

A second query shape selects authorized IDs and sort keys first, then fetches full records for the page. For the dispersed city case, the medians are 23.439 ms on-company, 35.424 ms with separate arrays, and 16.112 ms with normalized rows. The normalized plan reads 100,205 city index entries and 10,000 access index entries, hash-matches them, sorts 98 survivors, and fetches only 50 full records. With the next-page cursor, the normalized case returns the remaining 48 records in 9.687 ms.

That same rewrite is not universally better: without the city filter, access restricted to the oldest 1,000 records produces 9,999,101 permission probes and a 4,820.705 ms median with normalized rows, versus 2.694 ms for the direct form. PostgreSQL chooses an ordered scan expecting to find enough authorized rows earlier. This is a concrete plan-stability risk from access/sort correlation, not an inherent need for every separate-table query to join 10M records.

All eight scenarios, including overlapping groups and next-page cursors, return identical ordered records across layouts and both query shapes. The separate array table contains 10M rows and occupies 1,233 MB including indexes; the normalized table contains 15,001,000 rows and occupies 2,284 MB including indexes. These sizes exclude the business table and do not establish complete-layout storage savings: the common company heap intentionally still contains access arrays in every read comparison.

These are PostgreSQL 15.14 local SQL execution measurements, not API latencies or production p95. Repeated execution warms caches, but the 128 MB shared-buffer pool cannot retain every sparse working set. Index-only plans benefit from freshly vacuumed tables; concurrent updates can add heap fetches. The comparison does not yet measure durable permission writes, six-action storage, high-cardinality predicates, concurrent traffic, or prepared generic plans. Scripts, exact SQL, full JSON plans, and equality checks are in the `separate-access-*` benchmark files.

Reproduction files and outputs are under `.codex/permissions-rework/bench/`. Keep them with the artifact's performance evidence before extracting the relevant PRs.

### Logged write and interference experiments

The write experiment uses a separate logged 10M-row table on PostgreSQL 15.14, an Apple M2 Pro with 10 logical CPUs and 32 GiB RAM. PostgreSQL has 128 MiB shared buffers; the operating system can cache additional data, so this is not a cold-storage test. The table has random-looking UUID primary keys, a 256-byte inline business payload, six small action arrays, four B-tree indexes, and one GIN read-access index. WAL, fsync, full-page writes, synchronous commits, and autovacuum remain enabled. Initial heap plus indexes occupy 8,527,331,328 bytes, approximately 7.94 GiB.

The unrestricted worker appends one access group to all six arrays, commits each batch, and scans in physical insertion order through the created-time index. Three concurrent read clients each attempt up to ten queries per second. Reader statements have a 200 ms server deadline; write statements have a two-second server deadline. These are experimental controls, not chosen production defaults.

The worker committed 4,701,250 updates before stopping on a statement timeout. Earlier timeouts reduced the batch size from 1,000 to 500, 250, then 125; even the 125-row batch timed out. The first 4.5M updates took approximately 11.6 minutes. No access update qualified for HOT. A post-failure observation showed roughly 24 GiB of cluster WAL since the starting snapshot and roughly 12 GiB of heap plus indexes. The WAL observation includes maintenance and other cluster writes, and cleanup was still active. This was a failed attempt at a full 10M pass, not a completed rebuild.

| Read probe during unrestricted writes | Successful-read p99 | Deadline errors / attempts |
| --- | ---: | ---: |
| Broad access on another table | 11.1 ms | 0 / 7,350 |
| Sparse access on another table | 44.4 ms | 3 / 7,331 |
| Sparse access plus city on the changing table | 90.7 ms | 13 / 7,295 |

Report these failures alongside the percentiles: successful-read p99 alone hides the interruptions. Client-observed error latency reached approximately 411 ms despite the 200 ms server deadline. The experiment did not isolate the cause of each slow batch; GIN cleanup, checkpoints, cache pressure, and concurrent vacuum need direct instrumentation before attributing an individual spike.

A follow-up on the same 10M-row table limited writes to a target of 3,000 rows/second and updated 250K rows in 250-row batches. It completed in 85.4 seconds, approximately 2,928 rows/second, with no write errors and no read errors across 2,546 read attempts. Write-batch p99 was 124.1 ms and maximum 346.3 ms. Successful-read p99 was 73.4 ms for the changing table's sparse city query and 25.5 ms for sparse reads on the other table. Cluster WAL increased by approximately 1.90 GiB. This short test supports rate limiting, but cache, maintenance state, and array contents differ from the first run, so it does not prove a causal improvement or a full-hour steady-state rate.

A second 250K-row follow-up temporarily reduced the GIN pending-list limit from 4 MiB to 256 KiB while retaining the 3,000-row/second target. It completed in 86.8 seconds at approximately 2,879 rows/second, again with no read or write errors. The changing-table read p99 was 74.0 ms, but write-batch p99 increased to 176.1 ms and maximum to 572.2 ms. This does not establish a benefit from the smaller pending list. Autovacuum state, cache contents, and array lengths changed between runs; the default index setting was restored afterward. Do not select a production GIN setting from these short sequential comparisons.

A deliberately held permission-update transaction blocked an ordinary edit on the same business row until the editor's 100 ms lock deadline fired; the client observed the error after 179 ms. Holding the permission update on a separate projection row allowed the business edit to complete in 1.7 ms. Both transactions were rolled back. This demonstrates the contention mechanism, not its frequency under normal traffic.

The no-change follow-up rejected all 1,000 candidates and created no new row versions. Its scan still emitted about 14 KB of WAL, consistent with page maintenance during access; avoiding logical updates does not promise zero WAL for the checking query.

The one-hour budget requires at least 2,778 completed record projections per second before predicate evaluation, inheritance traversal, or catch-up. Revision retirement adds separate write and maintenance costs. The throttled samples are close to that floor and leave little margin. None of these experiments validates the complete 10M rebuild objective, high-cardinality arrays, ordinary business-write throughput, or multi-tenant application capacity. The full pass with an adaptive write governor, explicit maintenance budgets, realistic rule evaluation, and competing application traffic remains an acceptance gate. Benchmark scripts and results use the `on-record-*` names in the benchmark directory. They mutate synthetic data and must be run against freshly prepared benchmark tables for a new comparable sequence; rerunning a completed target group deliberately skips already-updated rows.

Before the schema and compiler are treated as validated, measure:

1. Role-wide, owner-relative, regional, multi-field, and high-cardinality predicates with 1,000 members. Include skewed distributions and worst-case array lengths.
2. Sorted pagination, custom filters, joined reads, exact counts, grouping, and prepared-query plans under concurrent readers and writes.
3. Three-hop inheritance with overlapping parents, deleted/retargeted edges, technical junctions, and a root affecting 10M descendants.
4. Initial backfill and policy replacement while business writes continue. Ten million affected rows in 60 minutes requires at least about 2,778 completed rows/second before adding catch-up and activation work.
5. WAL volume, vacuum pressure, GIN pending lists, array/index growth, and temporary storage during replacement and cleanup.
6. Worker interruption, replay, reordered jobs, source changes during scans, Redis loss, and reconciliation recovery.

Use PostgreSQL 16, matching the development setup, for the acceptance benchmark as well as recording the existing PostgreSQL 15 results. Report hardware, concurrency, dataset distribution, cache conditions, p50/p95, baseline overhead, and sustained update rate. The 60-minute target covers affected output records and all required actions, not only a source scan.

As engineering targets for the artifact, start with SQL list-query p95 below 100 ms for common warm indexed cases and below 500 ms for the declared sparse-access scenarios. These are proposed targets to validate, not measured guarantees. The query deadline and cleanup margin must be selected alongside those targets; a 200 ms cutoff experiment is not the final product budget. Exact counts need separate measurement; do not change them to approximate counts without a product decision.

## Tenant resource isolation

The user explicitly rejects a four-second interactive query on the shared PostgreSQL instance. Fast successful reads and containment of expensive work are separate acceptance requirements. This applies to both on-record arrays and separate permission tables, and to business filters without record permissions.

Current source inspection finds a shared primary workspace pool and an optional shared replica pool per application process. The [pool configuration](packages/twenty-server/src/engine/twenty-orm/datasource/workspace-data-source.service.ts) sets node-postgres `query_timeout`; its primary and replica defaults are 10,000 ms. It does not set a general server-side `statement_timeout` there. The search ILIKE fallback already applies a transaction-local server timeout. Existing API rate limits and a nested-relation concurrency limiter are not a general database admission controller across workspaces and application instances. This describes inspected source defaults, not an audit of production database or proxy settings.

### Cancellation evidence

In the isolated benchmark database with the installed `pg` 8.12.0 driver, a 100 ms `query_timeout` rejected a query after about 101 ms while `pg_stat_activity` still showed its backend executing `pg_sleep`. Driver timeout and socket cleanup therefore cannot be treated as proof that expensive execution has stopped.

With a transaction-local 200 ms `statement_timeout`, the actual pathological permission query produced PostgreSQL cancellation code `57014` after roughly 275–276 ms in three trials. Immediately after the error, the backend could still be shutting down parallel workers. Including observation and explicit rollback, the backend became idle in 277–287 ms; the same connection then executed another query successfully. The local timeout reset after rollback. Exact evidence and the reproduction script are in `.codex/permissions-rework/bench/query-deadline-results.json` and `query-deadline-check.cjs`.

This demonstrates cancellation and transaction recovery, not a real-time deadline or multi-tenant performance guarantee. PostgreSQL's [statement timeout](https://www.postgresql.org/docs/15/runtime-config-client.html#GUC-STATEMENT-TIMEOUT) aborts statements; it does not preserve a resumable query plan or undo resources already consumed. Budget cleanup time, and do not release a connection or concurrency permit before execution and transaction cleanup have completed.

### Required execution controls

1. Apply a server-side deadline to interactive database statements, a shorter lock-wait budget where appropriate, and an end-to-end request deadline including admission and cleanup. Use scoped settings safely with pooled connections. Client cancellation is an additional mechanism, not a replacement for a server deadline.
2. Limit in-flight database work per workspace and globally across application instances. Admit work before it occupies a database connection. Bound queue length, queue wait, request fanout, and retries; use fair scheduling and sustained-work budgets so repeated short queries cannot monopolize the instance. One thousand workspace members must not imply one thousand simultaneous database connections.
3. Constrain parallel workers, sort/hash memory, and temporary disk usage for interactive work. PostgreSQL applies `work_mem` per operation and parallel worker, so it is not a total request-memory cap. Measure the tradeoff before selecting settings. See [resource consumption](https://www.postgresql.org/docs/15/runtime-config-resource.html).
4. Separate admission and budgets for interactive reads, exports/reports, and permission recomputation. Recompute in checkpointed transactions with bounded batches and a sustained write budget. Separate application pools still share database CPU, I/O, cache, WAL, and vacuum capacity; they do not provide physical resource isolation.
5. Route between measured access-first and business-first strategies. Any alternative plan after a cancellation must fit the remaining request budget and preserve authorization, ordering, and completeness. Never respond with an empty or incomplete page presented as complete merely because execution was cut off. A cancelled query cannot be resumed at its internal execution position; resumability must be designed with explicit candidates, cursors, or background jobs.
6. Track cancellations, completed requests, queue waits, resource pressure, and latency per workspace and query shape. A system that protects neighbors by repeatedly rejecting normal list views still fails the product acceptance test.

Statement cancellation limits duration, but does not guarantee zero interference on shared compute: even a short query can consume I/O, evict useful cache pages, or create contention. If the requirement is strict resource isolation instead of bounded interference under a measured service objective, infrastructure isolation such as separate database instances or tenant placement on independent compute is required. This storage design does not claim that schemas, separate tables, or a separate connection pool supply that isolation.

The next isolation benchmark must compare ordinary tenant traffic with and without a competing workspace issuing the pathological queries and running permission rebuilds. Measure normal-tenant p95/p99, completed throughput, cancellations, cleanup latency, queue fairness, and cache/I/O pressure. Run with realistic application-instance counts and repeated requests so per-process limits cannot produce a misleading pass. The three SQL read probes above are limited interference evidence, not a mixed-tenant application load test. Final concurrency limits and deadlines require that broader evidence.

## Rollout and migration

Keep the existing record-sharing feature flag and add an RLS rollout flag using the repository's feature-flag conventions. RLS remains behind its enterprise entitlement. Do not infer a new sharing entitlement from license headers or move it into the RLS paywall.

Start with schema preparation and projection computation that cannot grant access until explicitly activated. Preserve existing permissions by translating their effective grants, rather than applying private-by-default as a destructive migration of existing workspaces.

Shadow comparisons need an oracle for the agreed new semantics: the old restrictive evaluator is not an equality oracle for every new additive policy. Use old behavior as a regression oracle only for scenarios whose semantics are intended to remain equivalent. For new policies, compare SQL and in-memory evaluation against explicit authorization examples.

A flag rollback or entitlement change must not turn private data public. Define the fallback path before activation: either an equivalent legacy policy remains available, or the active policy continues to enforce while editing/creation of the feature is disabled. Do not fall through to unrestricted access when a flag is off, a projection is missing, or a required policy fails to compile.

Use the current upgrade-command directory at implementation time, increasing epoch timestamps, `up`/`down`, and generated instance migrations for entity changes. Add columns and indexes incrementally, batch backfills, and avoid long table locks. User data and derived projection state have different rollback lifecycles.

## Validation and product artifact

The current row-policy and object-sharing unit suites passed 45 tests on the investigated baseline. Shared and UI packages were rebuilt, and the local server/worker started successfully. The browser reached sign-in, but the existing permission screens have not yet been compared live because browser control became unavailable. Complete that comparison before implementing the redesigned screens.

Acceptance examples must include two members sharing a role but having different owners/regions; missing member values; role reassignment; field restrictions under every grant source; non-overridable record capabilities; additive action grants; Receive; no implicit creator access; delegation bounded by sender access; persistence after sender access loss; and preservation of the deferred post-update restriction.

Cover every surface in the authorization matrix and declare the live or projected contract for each event-delivery path. Compare event decisions with the corresponding query strategy at the same policy/source state. For inheritance, prove that removing one source preserves others and that no path configuration bypasses the hop limit or target capabilities. For propagation, prove convergence and revision isolation through failure injection, not only successful queue processing.

For query routing, compare live and projected results after catch-up for every grant source, action, authority context, and dynamic member binding. Cover direct shares materialized on their original targets as well as inherited grants. Before catch-up, assert the intended asymmetry: a revoked grant cannot authorize a live detail fetch or new share, while a collection may retain its old projected result; a new live grant may precede collection visibility. Verify that a timed-out live check never falls back to a stale allow, `LIMIT 1` does not change a collection's route, nested collections retain per-alias authorization, candidate policy revisions do not grant early, and caches or replicas cannot silently defeat the live freshness contract.

The product artifact should provide seeded roles/members, representative managed objects, explicit shares, three-hop relations, pending/failed recomputation states, and scripts for the large performance datasets. Keep large datasets isolated from the user's normal development database. Run the frontend, backend, and worker together and exercise the complete product flows.

Create the implementation on a `codex/` branch; the dependent product questions are resolved. Preserve unrelated local files. Rebuild shared outputs after branch changes, use direct package typechecks, and run focused tests and diff lint as changes require. This document does not constitute an implemented or performance-accepted product artifact.

## Successive PR extraction

The testable artifact can be developed end to end, then decomposed into a dependency-ordered series. Each PR should leave its feature dormant or internally consistent and carry the relevant behavioral checks. An initial extraction map is:

1. Permission vocabulary and explicit behavior fixtures.
2. Record-capability types and metadata schema.
3. Record-capability migration and compatibility mapping.
4. Capability enforcement in SQL and in-memory policy evaluation.
5. Action-grant RLS metadata and manifest serialization.
6. RLS compiler changes and authority-source isolation.
7. Access-group schema and canonical binding identities.
8. Group membership resolution and cache versioning.
9. Internal permission projection schema and protected metadata, following the selected storage layout.
10. Incremental indexes and workspace migration support.
11. Workspace sharing-source schema and provenance.
12. Share delegation checks and persistence semantics.
13. Related-record path metadata and validation.
14. Path compilation, dependency maps, and traversal indexes.
15. Durable invalidation integrated with source transactions.
16. Recompute workers, leases, batching, and replay handling.
17. Inheritance recomputation and grant retraction.
18. Reconciliation and drift recovery.
19. Policy revision publication, progress, and rollback.
20. Materialized authorization in the repository and query runners.
21. Search, export, event, and alternate-surface coverage.
22. Role permission cards and conditional action editor.
23. Related-record picker, managed-object capability states, and sharing panel.
24. Access explanations, rollout controls, and full performance acceptance evidence.

Revise this map around the final implementation. It is not a commitment to split tightly coupled schema and enforcement changes in an unsafe order.

## Remaining implementation and validation work

No numbered product question remains pending. The work below is engineering follow-through within the agreed scope, not a new approval gate.

| Work | Completion evidence |
| --- | --- |
| Live UI baseline and artifact flows | Run the app and compare role settings, related-record configuration, and sharing interactions with the inspected Figma designs. |
| Shared permission semantics | Behavioral tests for the Receive/inheritance examples, all authority intersections, capabilities, and deferred post-update behavior. |
| Publication and propagation | Durable invalidations, complete writer coverage, generation fencing, crash/replay tests, and publication concurrency tests. |
| Live and projected parity | Equal decisions after catch-up for the same active revision, source snapshot, record, action, and authority context. |
| Performance and tenant containment | A completed 10M-row rebuild within the agreed budget, concurrent interactive workloads, skewed/fanout-heavy query plans, cancellation cleanup, and bounded admission/queueing. The current measurements do not establish this acceptance. |
