# Replacing TypeORM on the workspace read path: first-pass evidence

Status: investigation, no code change proposed yet. Everything below is either a file
reference you can check or a measurement you can re-run (see `bench/`).

Question asked: can `packages/twenty-server` drop TypeORM for workspace data in favour of
raw parameterised SQL plus a small composition library, and what would that actually buy?

Short answer from this pass: **most of the read path is already SQL that Twenty writes
itself, and the parts that are not are cheaper than the profile suggests. What TypeORM is
really being paid for on reads is not entity mapping, it is `EntityMetadata` existing at
all — and writes need that same object today. Bypassing it on reads shrinks what the
cache is used for; it does not delete the cache.** The strongest case for change is not
CPU, it is that four separate call sites reach into `QueryExpressionMap` to recover or
patch what the builder did, because they were not the ones who built it:

- `permissions.utils.ts:270` recovers the entity, operation and column list
- `permissions.utils.ts:422` recovers order-by columns per joined alias, by regex
- `workspace-select-query-builder.ts:434` rewrites `joinAttribute.condition` in place
- `process-nested-relations-v2.helper.ts:527` filters `expressionMap.aliases` directly

---

## 1. Scope

TypeORM is used for two unrelated things in this package, and only one is in scope.

| | entities | in scope |
|---|---|---|
| `core` / `metadata` schemas | 76 files with `@Entity()`, real decorated classes, real migrations, `UpgradeAwareEntityMetadataAdapter` rewriting column visibility per upgrade cursor | **no** — this is what an ORM is for |
| workspace schemas (`workspace_<hash>`) | zero classes; `EntitySchema` synthesised per request-workspace from `core.objectMetadata` / `core.fieldMetadata` | yes |

`UpgradeAwareEntityMetadataAdapter` (`src/engine/twenty-orm/upgrade-aware/upgrade-aware-entity-metadata.adapter.ts:33`)
injects `coreDataSource`, not the workspace one. Nothing in this document touches core.

Surface for the in-scope half: 104 `getRepository(` call sites in `src` of which 54 are
against a workspace data source, 78 files calling `createQueryBuilder(`, and 285 `find*`
calls under `src/modules`. The GraphQL/REST query runners are a slice of that, not the
whole of it.

## 2. The traced read path

`POST /graphql` → `findMany` on a standard object. Files in call order.

| # | step | code | needs from TypeORM |
|---|---|---|---|
| 1 | resolve role permissions, get repository | `common-base-query-runner.service.ts:315-352` | `getRepository(nameSingular)` → `findMetadata` linear scan over the workspace's `EntityMetadata[]` (`global-workspace-datasource.ts:82-89`) |
| 2 | parse GraphQL selection into flat column names | `graphql-selected-fields.parser.ts:92-203` | nothing. Composites are flattened to `nameFirstName` here (`:266`) from `compositeTypeDefinitions` |
| 3 | build filter | `graphql-query-filter-*.parser.ts` → `compute-where-condition-parts.ts` | **string concatenation only.** Twenty writes the SQL itself: `` `"${objectNameSingular}"."${key}" = :${key}${suffix}` `` (`compute-where-condition-parts.ts:42-74`). TypeORM binds `:name` params and nothing else |
| 4 | build order by | `graphql-query-order.parser.ts` | same; `getOrderByRawSQL` (`graphql-query.parser.ts:179`) already emits the ORDER BY as a raw string for the group-by path |
| 5 | join, only if ordering by a relation field | `add-relation-join-alias.util.ts:24` | `leftJoin('person.company', 'company')` — **the one place relation metadata is genuinely used on reads** |
| 6 | column list | `build-columns-to-select.ts:14` | `setFindOptions({ select })`: property-name → column-name mapping, which for workspace entities is the identity function (columns are declared flat, `entity-schema-column.factory.ts:75-114`) |
| 7 | pagination | `common-find-many-query-runner.service.ts:171` | `take(n)` → two-phase `distinctAlias` query keyed on the primary column |
| 8 | permission check | `workspace-select-query-builder.ts:375-385` → `permissions.utils.ts:270` | reads `expressionMap.aliases[0].metadata.name`, `expressionMap.selects`, `expressionMap.joinAttributes`, `expressionMap.orderBys`, and **regex-parses `"alias"."column"` back out of the select strings** (`permissions.utils.ts:385`, `:436`) |
| 9 | row-level permission predicates | `apply-row-level-permission-predicates.util.ts:24` | `Brackets` + `.andWhere`. Predicates come from `FlatObjectMetadata` + `flatFieldMetadataMaps` through the *same* filter parser as user filters. No `EntityMetadata` |
| 10 | soft delete | `applyDeletedAtToBuilder` / `withDeleted()` | the implicit `deletedAt IS NULL` comes from the `deleteDate: true` column flag |
| 11 | execute + hydrate | `workspace-select-query-builder.ts:138-166` | `super.getMany()` — pg rows → entity instances with **flat** properties |
| 12 | flat → nested | `format-result.util.ts:51` | nothing. Rebuilds composites from `flatFieldMetadataMaps` |
| 13 | relations | `process-nested-relations-v2.helper.ts:63` | **separate queries, never joins.** One query per relation field, `IN (:...ids)`, plus a `CROSS JOIN LATERAL (VALUES ...)` for the per-parent limit built as a raw string (`:504-537`) |
| 14 | field handlers | `common-result-getters.service.ts` | nothing (rich text, files, workspace member avatars) |
| 15 | nested → GraphQL JSON | `object-records-to-graphql-connection.helper.ts:150` | nothing. Walks composites again |

Steps 12, 14 and 15 are three full walks of every record after the driver has already
built one object per row.

## 3. The six questions

### 3.1 What is plain column mapping that raw SQL replaces trivially?

Steps 3, 4, 6, 7, 10, 11. Concretely:

- WHERE and ORDER BY are already Twenty-authored SQL strings. TypeORM is a parameter
  binder there. `getOrderByRawSQL` proves the ORDER BY half is already portable.
- `select` is a `Record<columnName, true>`. Because `entity-schema-column.factory.ts`
  declares every column with `name === key`, TypeORM's property→column mapping is the
  identity function for workspace entities.
- Hydration produces an object with flat keys (`nameFirstName`), which is exactly the pg
  row. `formatResult` then does the real work.
- Soft delete is `AND "x"."deletedAt" IS NULL`.
- `take(n)` is the `distinctAlias` behaviour PR #23980 works around. Written by hand it is
  `LIMIT n` when no to-many join is present, which is the general case since relations are
  loaded separately.

### 3.2 What depends on real entity semantics?

Almost nothing, and this is the load-bearing finding.

- **Composite types** (currency, address, links, phones, fullName, actor, emails): TypeORM
  never sees them. `EntitySchemaColumnFactory.createCompositeColumns` expands one field
  into N flat columns before TypeORM is involved; `formatResult` reassembles them after.
  Not TypeORM embeddeds, not TypeORM transformers.
- **Value transformers**: zero. `grep -rn "transformer" src/engine/twenty-orm` matches only
  `EntitySchemaTransformer` (the metadata builder) and `PlainObjectToDatabaseEntityTransformer`
  (used on the `save` path only).
- **Computed / derived fields**: none on the entity. `searchVector` is a real generated
  column, handled in DDL.
- The genuine semantics TypeORM contributes on reads are three flags: `deleteDate` (implicit
  soft-delete filter), `primary` (the `distinctAlias` key), and relation metadata for the
  order-by join in step 5. Two are one-liners; the third is discussed in 3.4.

### 3.3 How are row-level permission predicates applied?

Two separate mechanisms, and they answer the question differently.

**Predicates (which rows)** — `apply-row-level-permission-predicates.util.ts`. Built from
`FlatObjectMetadata` and `flatFieldMetadataMaps` via `GraphqlQueryFilterFieldParser`, the
same parser used for user filters. For joined aliases, `render-row-level-permission-filter-to-sql.util.ts`
emits SQL and parameters and Twenty splices them into `joinAttribute.condition` by hand
(`workspace-select-query-builder.ts:462-480`). **No `EntityMetadata` dependency.**

**Validation (which objects and fields)** — `permissions.utils.ts`. This one *does* depend
on TypeORM, but not for semantics: it depends on `QueryExpressionMap` as a way to find out
what the query it was handed contains. It reads `aliases[0].metadata.name` for the entity,
`queryType` for the operation, `selects` for the columns, and where a join is present it
regex-matches `/"(\w+)"\."(\w+)"/` over the select and order-by strings to recover
alias/column pairs (`:385`, `:436`).

That is the clearest argument in the whole investigation, and it is an argument about
structure rather than speed: a caller that generates its own SQL already knows the object,
the operation and the exact column list. The reverse-engineering layer is not replaced by
raw SQL, it is deleted by it. `getSelectedColumnsFromExpressionMap` splitting on `.` and
taking the last segment, and `ProcessAggregateHelper.extractColumnNamesFromAggregateExpression`
pulling column names back out of aggregate SQL, both exist only because the permission check
runs downstream of a builder it did not drive.

### 3.4 How are relations loaded?

Separate queries, always, except for ordering.

`ProcessNestedRelationsV2Helper` issues one query per relation field with concurrency 4,
then stitches results in JS (`:563-588`). To-many gets a `CROSS JOIN LATERAL` over a
`VALUES` list to bound rows per parent — assembled as a raw string from
`perParentRecordIdsQueryBuilder.getQuery()`, with the parent ids filtered through
`isValidUuid` and interpolated (`:498-519`). It already reaches under the builder and edits
`expressionMap.aliases` directly (`:527-530`).

So "what would replace the join loading" is: nothing, it is already replaced. The only join
TypeORM generates from relation metadata on a read is the ORDER BY join in step 5 (and the
equivalent in group-by, `common-group-by-query-runner.service.ts:392`, which already passes
an explicit ON condition and so needs the relation only for the alias). Both are
`LEFT JOIN "<schema>"."<target>" AS "<alias>" ON "<parent>"."<fk>" = "<alias>"."id"`,
derivable from `flatFieldMetadataMaps` alone.

### 3.5 Do writes need `EntityMetadata` in a way reads do not?

Yes. This is the finding that most changes the shape of the answer.

The common API write path does not use `save`/`EntityPersistExecutor` — it uses
`repository.insert`, `updateMany`, and the delete/soft-delete builders
(`common-create-many-query-runner.service.ts:230`, `:431`, `:460`). Composite → flat
conversion is again Twenty's (`format-data.util.ts:18`, called from
`workspace-insert-query-builder.ts:109`). But `InsertQueryBuilder` / `UpdateQueryBuilder`
still derive from `EntityMetadata`:

- the insert column list and ordering, plus per-column defaults
- `createDate` / `updateDate` / `deleteDate` behaviour. Both `createdAt` and `updatedAt`
  carry `defaultValue: 'now'` (`partial-system-flat-field-metadatas.constant.ts:60`, `:91`)
  so both get `DEFAULT now()` on insert, but a column default does not fire on UPDATE:
  `updatedAt` is maintained by TypeORM's `updateDate: true` flag alone
  (`entity-schema-column.factory.ts:98`)
- `RETURNING` column mapping back to entity shape, which every write runner relies on to
  emit its database event

`EntityPersistExecutor` is still reached through `.save()` from 82 call sites across 50
files, a mix of core and workspace repositories.

Consequence: keeping TypeORM for writes keeps `EntityMetadata` per cached workspace, which
is the 16.2M-objects-per-pod item. **A read-only bypass does not delete that cost, it only
stops paying it on the hot path.** Whether the cache shrinks at all depends on whether the
same workspaces are read-heavy and write-light, which is likely but unmeasured. If the
memory number is the goal, PR #23984's approach (keep the serialisable `EntitySchema`
recipe cold, rebuild in ~3-4ms on demand) attacks it directly and is a much smaller change.

### 3.6 What does the migration / DDL system use?

Nothing worth keeping, and it is already separable.

`src/engine/twenty-orm/workspace-schema-manager/services/*` build DDL as strings and call
`queryRunner.query(sql)` (`workspace-schema-column-manager.service.ts:24-26`). Identifiers
go through `escapeIdentifier` (`remove-sql-injection.util.ts:11`), and there is an
`assertSafeTsVectorExpression` guard for generated-column expressions. Across the whole
`workspace-migration` tree the only TypeORM imports are `QueryRunner`, `DataSource`,
`ColumnType` and `QueryFailedError`. TypeORM is a connection pool and a transaction handle
there. Any of the candidate libraries provides both.

## 4. Measurements

Numbers below from this container, Node on Linux. See the appendix for how to re-run them.

### 4.1 What `EntityMetadata` costs to build

Synthetic workspaces shaped like the measured one, built through the same
`EntitySchemaTransformer` + `EntityMetadataBuilder` pair as
`workspace-orm-entity-metadatas-cache.service.ts:81`.

| shape | columns | relations | build (median) | traced objects |
|---|---|---|---|---|
| 33 objects, no relations | 726 | 0 | 3.3 ms | 2,948 |
| 33 objects, 4 relations each | 726 | 132 | 12.7 ms | 4,015 |
| 100 objects, 4 relations each | 2,200 | 400 | 24.5 ms | 12,122 |

Two things to take from this, and one not to.

- Build time is 3-4ms for a dev-sized workspace, matching what the
  `charles/orm-metadata-serializable` branch found, and it is dominated by relations:
  adding 132 relations to the same 726 columns costs 4x the build time and 36% more objects.
- Cost is linear in columns, so it scales with custom fields, not with traffic.
- **Do not compare the object counts to the 40,726 from the heap snapshot.** This traversal
  dedupes strings globally and does not count property backing stores, so it is a lower
  bound on structural nodes only. It corroborates the shape (linear, relation-heavy), not
  the magnitude.

### 4.2 What SQL generation costs

A 60-column `findMany` with one ILIKE filter, one ORDER BY and a limit:

| | median |
|---|---|
| TypeORM `createQueryBuilder` + `getQueryAndParameters` | 231 µs |
| Kysely build + `compile()` | 149 µs |
| hand-rolled template string | 3.7 µs |

Switching builders recovers about a third of query-construction time. Generating the SQL
directly recovers 98%. If CPU is the motive, the library is not where the win is; caching a
compiled shape per (object, selected-field-set) is.

### 4.3 Reconciling with the Sentry profile

PR #23980's own profile table, slow `POST /graphql` (>3s) vs normal (<300ms):

| | slow | normal |
|---|---|---|
| GC | 25.8% | 8.4% |
| cold-storage demote | 18.6% | 0% |
| pg driver `parseRow` | **14.6%** | 6.6% |
| **TypeORM entity hydration** | **3.0%** | 2.5% |

The 14.6% is the **pg driver** parsing wire rows into JS objects. That cost survives
removing TypeORM — it is paid by any client that returns rows, including all five
candidates (postgres.js has a faster parser, but it is still the same order). The part
attributable to TypeORM hydration is 3.0% of slow-request event-loop time.

Any framing of this work as "14.6% of the event loop is TypeORM hydrating rows" is wrong,
and the read-path bypass should not be sold on it. The honest CPU budget for a read bypass
is roughly: 3.0% hydration + a share of the 231µs/query construction + one of the three
post-query record walks. Real, worth having, not transformative on its own. GC at 25.8% is
the larger number, and that is a memory-shape argument, i.e. 3.5.

## 5. Library assessment

Injection safety was tested rather than read about: each library was handed the identifier
`name" , (SELECT pg_sleep(10)) AS "x` in a column position (`bench/identifiers.js`).

| library | dynamic identifier API | result with the hostile identifier | notes |
|---|---|---|---|
| Kysely | `sql.ref()`, `db.dynamic.ref()`, `withSchema()` | escaped: `"name"" , (SELECT pg_sleep(10)) AS ""x"` | `withSchema()` takes a runtime string, so `workspace_<hash>` qualification is native. `sql.raw()` does **not** escape, as documented |
| Drizzle (query builder standalone) | `sql.identifier()`, `pgSchema()` | escaped identically | requires a table object; building one per (workspace, object) at runtime is possible but is the same per-workspace object graph problem in a new shape |
| pg-promise | `pgp.as.name()`, `$1~` | escaped identically | **but values are escaped client-side and inlined, not bound.** `$1` produced `'abc'` in the SQL text. Well-audited, still a different threat model to `$1` binding |
| postgres.js | `sql(identifier)` | escaped, and `.` is rewritten to `"."` | `escapeIdentifier('a.b')` yields `"a"."b"`; harmless given Twenty's name regex but it is not a strict identifier escape |
| @databases/pg | `sql.ident()` via `@databases/escape-identifier` | escaped, plus validation: throws on non-ASCII and on **>60 characters** | that limit is a real incompatibility — `IDENTIFIER_MAX_CHAR_LENGTH` is 63, so a legal 61-63 char field name would throw |

Two conclusions.

1. **Identifier escaping is not a differentiator.** All five escape. More importantly,
   Twenty does not currently rely on escaping at all: object and field names are validated
   at write time against `/^[a-z][a-zA-Z0-9]*$/`
   (`validate-flat-field-metadata-name.util.ts:13`, same for objects), schema names are
   `workspace_` plus a hash, and `escapeIdentifier` already exists in-tree
   (`remove-sql-injection.util.ts:11`). The existing raw-SQL sites
   (`compute-where-condition-parts.ts:42`) interpolate identifiers with plain `"` wrapping
   and are safe because of that regex, not because of a library. Any move to raw SQL should
   route every identifier through the in-tree `escapeIdentifier` as defence in depth, but
   that is one function, not a reason to adopt a dependency.
2. **The choice should be made on composition ergonomics and on not re-creating a
   per-workspace object graph.** Kysely is the best fit of the five: `withSchema` takes a
   runtime string, `sql` fragments compose with bound parameters (which is what
   `computeWhereConditionParts` already produces, modulo `:name` → `$n`), lateral joins are
   supported, and it can compile without a connection which makes both-paths diffing easy.
   Drizzle standalone is a poor fit specifically because its table objects would reintroduce
   per-workspace structures. postgres.js is the fastest driver but the weakest composer.
   pg-promise's inline value escaping is a step away from parameter binding, which is the
   wrong direction for this codebase.

But per 4.2: even Kysely costs 149µs on a 60-column select. If the read bypass is built,
the shape most likely to pay for itself is a generator over the flat maps producing a
parameterised string plus a positional param array, with the in-tree `escapeIdentifier` on
every identifier and the SQL text memoised per query shape. A library would then be used
for the driver and transactions, not for composition — which points at `pg` (already a
dependency) or postgres.js, not at a query builder.

## 6. What the evidence supports doing next

The proposed shape ("keep TypeORM for writes, DDL and transactions; bypass hydration on
reads") holds up, with two corrections:

- It will not remove the `EntityMetadata` cache, because writes need it (3.5). Sell it as
  latency and as deleting the expression-map reverse-engineering, not as memory.
- Its CPU headline is ~3% of hydration plus query construction plus one of three record
  walks, not 14.6% (4.3).

Sequencing, smallest verifiable step first:

1. **Land and measure PR #23980.** Nothing here changes that; two of its three changes
   target larger numbers than anything in this document.
2. **Salvage from `charles/orm-metadata-serializable`** regardless of what happens to the
   read path: the `localDataOnly` / `coldStorable` split is a correctness fix (they were
   conflated), and the timer-callback guard fixes a real throw-with-no-caller. The cold
   `EntitySchema` recipe attacks the 16.2M-object number directly and is far smaller than
   an ORM bypass.
3. **Prove the mapper before the SQL.** Steps 12→14→15 are three walks producing GraphQL
   JSON from a flat row, all driven by the same flat maps, none of them touching TypeORM.
   Fusing them into one generated-per-shape mapper is independently valuable, testable
   against the current output record-for-record, and does not require a single query to
   change. If that does not move p90, the SQL half is unlikely to.
4. **Then** a read-only SQL generator for `findMany` on a single object with no relation
   ordering, behind a flag, running both paths and diffing the GraphQL response per
   resolver. Kill criteria stated in advance: if the diff harness finds semantic gaps in
   more than a handful of field types, or if the flagged path does not beat the TypeORM
   path by more than the diff harness costs, stop.

What should *not* be attempted from this evidence: replacing the 285 `find*` call sites
under `src/modules`, or touching the write path. Both are large, and neither has a measured
number behind it.

## Appendix: reproducing

```bash
cd packages/twenty-server/docs/investigations/orm-read-path/bench
npm init -y
npm i typeorm@0.3.31 pg reflect-metadata kysely drizzle-orm pg-promise postgres @databases/pg
node entity-metadata.js   # section 4.1
node compile.js           # section 4.2
node identifiers.js       # section 5
```

No database connection is required by any of the three.
