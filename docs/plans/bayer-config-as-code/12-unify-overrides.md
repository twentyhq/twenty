# 12 — Sub-plan: Unify the Two Override Mechanisms (PR4, expanded)

> Deep-dive on gap **G2** / roadmap **PR4**. Scope: collapse the **two** override mechanisms into one
> facet-driven, i18n-capable concept with a single read path, a single write path, and a single
> registry source of truth — without losing capability or breaking the GraphQL API.

This is the highest-risk PR in the plan (`09` §B) because it touches the **hot** object/field resolve
path and the translation system. It is expanded here so it can be sequenced safely.

---

## A. The two mechanisms today (precise, with anchors)

| Aspect | **`standardOverrides`** (object/field) | **`OverridableEntity.overrides`** (view, view-field, view-field-group, command-menu-item, page-layout-tab, page-layout-widget) |
|--------|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| Storage | `standardOverrides` JSONB column, hand-rolled on the entity (`object-metadata.entity.ts`, `field-metadata.entity.ts`); base class `SyncableEntity` | `overrides` JSONB **+ `isActive`** on `OverridableEntity` (`overridable-entity.ts`) |
| Shape | **Typed DTO** with a nested **`translations` per-locale map** (`object-standard-overrides.dto.ts`: `labelSingular/labelPlural/description/icon/color/translations`; field: `label/description/icon/translations`) | Per-entity flat `TOverrides` type (e.g. `ViewOverrides`, `CommandMenuItemOverrides`); **no translations** |
| Read / resolve | `resolveObjectMetadataStandardOverride` / `…Field…` — **i18n-aware, layered precedence**: icon/color override → `translations[locale][key]` → flat override → `translateStandardLabel(base, i18n, applicationCatalog)`; branches on `isStandardApp` | `resolveFlatEntityOverridableProperties` = **flat `{...flatEntity, ...overrides}`**; no locale, no i18n, no precedence |
| Write / sanitize | `sanitize-raw-update-object-input.ts` — reduces changed props into the blob (add when ≠ base, delete when = base, null when empty) | `sanitizeOverridableEntityInput` — same add/remove/null logic, but **registry-driven** via `ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME` (derived from `isOverridable`) |
| Which props are overridable | **hardcoded** in the DTO + resolve util | **registry-derived** (`isOverridable` per property) |
| Routing (when to override) | implicit in the update path | explicit: `shouldOverride = isCallerOverridingEntity(caller, entityApp, workspaceCustomApp, isSystemSideEffect)` |
| `isActive` | object/field declare **their own** `isActive` (default **false**) | inherited from `OverridableEntity` (default **true**) |
| GraphQL exposure | **`standardOverrides` is in the public metadata GraphQL schema** (front `generated-metadata/graphql.ts`, client-sdk types) | `overrides` is applied server-side; resolvers return resolved values |
| Sync/reconcile | property registry has a `standardOverrides` entry (`toCompare/toStringify: true`) | property registry has an `overrides` entry (`toCompare/toStringify: true`) + `isActive` |

## B. The real problem is not "two columns" — it's three asymmetries

1. **Translations / i18n (the hard one).** `standardOverrides` carries a per-locale `translations` map
   and its resolve integrates Lingui + the standard-app `applicationCatalog`. `overrides` has **none of
   this**. Unifying "downward" (make object/field use the flat spread) would **silently drop
   translation support** — unacceptable. So the unified mechanism must be the **superset**.
2. **Resolve precedence.** `standardOverrides` has real precedence (icon/color special-cased,
   translation before flat, i18n fallback). `overrides` is a naive spread. A unified resolver must
   express precedence and be a no-op flat spread for entities without translatable properties.
3. **Registry-driven vs hardcoded + `isActive` default.** `overrides` is registry-derived; `standard
   Overrides` is hardcoded; and the `isActive` **default differs (false vs true)** — a migration
   landmine if object/field naively adopt `OverridableEntity`.

## C. Target design — one override concept (superset)

A single mechanism, driven by the **facet registry** (`03` §A), that subsumes both:

1. **One column.** `overrides` (JSONB) on a shared base, carrying flat overridable properties **and**,
   for `presentation`-facet properties flagged `translatable`, a nested `translations` sub-map. Object
   and field adopt this base (B1-shaped) — but see §D for the column-name/compat nuance.
2. **One write util** — generalize `sanitizeOverridableEntityInput` to (a) be the only writer, (b)
   handle the nested `translations` sub-map for translatable properties, (c) keep the add/remove/null
   semantics. Retire `sanitize-raw-update-object-input`'s bespoke branch.
3. **One read util** — `resolveEffectiveEntity(flatEntity, { locale, i18n, applicationCatalog, facetsByProperty })`:
   for each overridable property, precedence = `override value` → (`translatable` & locale)
   `translations[locale][prop]` → base → `translateStandardLabel` fallback. For entities with no
   translatable props / no `translations` (views, layouts, commands) it **reduces to the flat spread** —
   so it is a strict superset of `resolveFlatEntityOverridableProperties` and of the two
   `resolve-*-standard-override` utils. Retire all three.
4. **Registry is the single source of truth.** Extend each property's registry entry with
   `facet` (already planned in `03` §A) and a `translatable?: boolean`. `ALL_OVERRIDABLE_PROPERTIES_BY_
   METADATA_NAME` already derives from the registry; `standardOverrides` becomes registry-derived too,
   deleting the hardcoded DTO-driven list.
5. **Unify `isActive`.** Treat `activation` as one facet with one column semantics; explicitly decide
   object/field's default (see §D.3) — do **not** let it silently flip.

The anonymous single-slot, last-writer-wins nature of the blob is **unchanged** (per `03` §B). If
owner-tagged multi-contributor layering is ever needed, that is separate schema work — out of scope here.

## D. The B1 vs B2 decision, made precisely

The earlier plan framed this as "B1: object/field extend `OverridableEntity`" vs "B2: keep
`standardOverrides` as a facet-typed projection." With the code in hand, the decision hinges on **GraphQL
compat** and **translations**, not aesthetics.

- **`standardOverrides` is a public GraphQL field.** Renaming/removing it is an **API breaking change**
  (front-end + client SDK consume it). So a big-bang column rename is out.
- **Decision (updated): clean B1, GraphQL break accepted, one PR.** The product owner confirmed the
  `standardOverrides` GraphQL field has negligible external usage, so **no deprecation alias** — we rename
  the column and field outright. This removes the two riskiest bits of complexity (the virtual-alias
  resolver and the U5 deprecation window). Concretely:
  - Object/field **extend `OverridableEntity`**; `standardOverrides` (JSONB) is **replaced by `overrides`**
    (JSONB), carrying the same content **including the `translations` sub-map**. The two bespoke DTOs
    (`Object/FieldStandardOverridesDTO`) and the `standardOverrides` GraphQL field are **deleted**; the
    `overrides` shape is exposed instead (or a typed `presentationOverrides`).
  - **`isActive` guard:** object/field keep **default `false`** explicitly by overriding the column default
    (do **not** inherit `OverridableEntity`'s `true`); the migration asserts no existing row's `isActive`
    changed.
  - **One data migration** copies `standardOverrides` → `overrides` (preserving `translations`) and drops
    the old column. No alias, no window.
- **B2 fallback** (keep the `standardOverrides` column, unify only read/write/registry) is retained only if
  the storage migration proves too risky for the timeline — but with the GraphQL break accepted, clean B1
  is the target.

## E. Reconciliation / sync unification (removes the "special-case")

Today the diff/apply compares `standardOverrides` and `overrides` as two separate stringified
properties (`all-entity-properties-configuration-by-metadata-name.constant.ts`), and the
universal-flat-entity layer lists `standardOverrides` under
`metadata-universal-flat-entity-properties-to-compare.type.ts`. After unification:

- The comparator treats **one** `overrides` property (still `toCompare/toStringify: true`) uniformly for
  all overridable entities — the reconciler no longer branches on entity family.
- The workspace-config apply (`03` §E) writes `presentation`/`arrangement` into the same `overrides`
  blob everywhere, so managed-mode drift detection is uniform — no object/field special case.
- Translations flow through the one `overrides.translations` sub-map, so app-level translation sync
  (`application-translation-sync.service.ts`) and workspace presentation overrides have a single merge
  point (verify no double-application — §G risk).

## F. Single-PR execution plan (U0–U5 squashed) — internal commit order

One PR, but structured as **six commits** so a reviewer can go commit-by-commit (the parity commit is the
safety net that must land in the same PR since nothing ships incrementally). Recommended order:

1. **`c1` — Parity harness (tests only).** Golden snapshots of *today's* three resolvers + two write paths
   across the corpus (standard + custom objects/fields; all six Overridable entities; every locale;
   `isStandardApp` true/false; empty/partial/full overrides). This is the guard for the whole PR — if the
   final state doesn't reproduce these snapshots, the PR is wrong. (= former U0.)
2. **`c2` — Unified utils.** Add `resolveEffectiveEntity` (i18n-aware superset) + generalize
   `sanitizeOverridableEntityInput` for `translations`. Parity test (`c1`) now runs against the new utils
   too; both must match. (= former U1.)
3. **`c3` — Registry.** Add `facet` + `translatable` to object/field presentation properties; make the
   object/field overridable set registry-derived; assert it equals today's hardcoded set. (= U2.)
4. **`c4` — Storage + entities + migration.** Object/field extend `OverridableEntity`; drop
   `standardOverrides` column/DTOs; `overrides` carries the content incl. `translations`; explicit
   `isActive` default; the `standardOverrides → overrides` data migration (instance command) with the
   no-`isActive`-change assertion. (= U3, minus the alias.)
5. **`c5` — Swap all call sites + reconciler collapse.** Point the ~12 resolve call sites and the
   object/field write/create paths at the unified utils; replace the two registry/compare entries with one
   `overrides`; delete the three old resolvers + the bespoke object/field override branches; update mocks.
   (= U1-swap + U4.)
6. **`c6` — GraphQL + front-end + regen.** Remove the `standardOverrides` GraphQL field, expose
   `overrides`; regenerate `twenty-front`/`client-sdk` types; update the Settings → Data-Model rename UI to
   the new field. (= former U5, but done *in* the PR since the break is accepted.)

**Deps:** the `facet` annotation (roadmap PR1) should land first so `c3` is authoritative; otherwise this
PR carries a local facet addition for the object/field presentation props. No dependency on PR2/PR3.

## F2. File inventory & rough change size

Enumerated from the actual call sites (grepped). "LOC" is rough net change. Total: **~35–45 logic files +
~25–40 mock/test/generated files**; net new logic **~400–600 LOC**, total churn (incl. mocks/tests/regen)
**~1,500–2,500 LOC**. This is a **large PR** — hence the commit structure in §F.

### Core mechanism (the heart) — ~4 files
| File | Change | ~LOC |
|------|--------|------|
| `metadata-modules/utils/resolve-effective-entity.util.ts` *(new)* | Unified i18n-aware resolver (superset of the 3 below) | +100–140 |
| `metadata-modules/utils/sanitize-overridable-entity-input.util.ts` | Generalize for `translations` sub-map | +30–50 |
| `object-metadata/utils/resolve-object-metadata-standard-override.util.ts` | **delete** | −61 |
| `field-metadata/utils/resolve-field-metadata-standard-override.util.ts` + `utils/resolve-flat-entity-overridable-properties.util.ts` | **delete** both | −75 |

### Registry — 1 file
| File | Change | ~LOC |
|------|--------|------|
| `flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant.ts` | Add object/field presentation props (`facet`/`isOverridable`/`translatable`); drop `standardOverrides` entries; ensure `overrides` entries | +60 / −20 |
| `flat-entity/constant/all-overridable-properties-by-metadata-name.constant.ts` | none (derives from registry) | 0 |

### Entities + DTOs — ~6 files
| File | Change | ~LOC |
|------|--------|------|
| `object-metadata/object-metadata.entity.ts`, `field-metadata/field-metadata.entity.ts` | extend `OverridableEntity`; drop `standardOverrides`; `isActive` default override | ±15 each |
| `object-metadata/dtos/object-standard-overrides.dto.ts`, `field-metadata/dtos/field-standard-overrides.dto.ts` | **delete** (repurpose as `overrides` shape if kept) | −90 |
| `object-metadata/dtos/object-metadata.dto.ts`, `field-metadata/dtos/field-metadata.dto.ts` | replace `standardOverrides` field with `overrides`/`isActive` | ±20 |

### Resolve call sites — ~12 files, small edits (~5–15 LOC each)
`object-metadata.resolver.ts`, `field-metadata.resolver.ts`, `minimal-metadata/minimal-metadata.service.ts`,
`view/resolvers/view.resolver.ts`, `view/controllers/view.controller.ts`, `dataloaders/dataloader.service.ts`,
`subscriptions/metadata-event/metadata-event-publisher.ts`, `object-metadata/tools/object-metadata-tools.factory.ts`,
`.../from-object-metadata-entity-to-object-metadata-dto.util.ts`, `.../from-field-metadata-entity-to-field-metadata-dto.util.ts`,
`.../from-flat-object-metadata-to-object-metadata-dto.util.ts`, `.../from-flat-field-metadata-to-field-metadata-dto.util.ts`.

### Write + create/init paths — ~7 files
`flat-object-metadata/utils/sanitize-raw-update-object-input.ts`, `flat-field-metadata/utils/sanitize-raw-update-field-input.ts`
(retire the bespoke override branch); `from-update-object-input-…util.ts`, `compute-flat-field-to-update-…util.ts`;
`from-create-object-input-…util.ts`, `get-default-flat-field-metadata-from-create-field-input.util.ts`,
`build-default-flat-field-metadatas-for-custom-object.util.ts`.

### Sync / manifest / validator — ~6 files
`universal-flat-entity/types/metadata-universal-flat-entity-properties-to-compare.type.ts` (swap
`standardOverrides`→`overrides`); `application-manifest/converters/from-object-manifest-…util.ts` + field;
`flat-object-metadata-validator.service.ts`; `twenty-standard-application/utils/object-metadata/create-standard-object-flat-metadata.util.ts` + 2 field equivalents. **Verify** whether
`twenty-shared` `objectManifestType.ts`/`fieldManifestType.ts` carry `standardOverrides` (the converters
reference it) — if so, rename there too (+2 files).

### Migration — 1 file
New instance command: `standardOverrides` JSONB → `overrides` JSONB on `objectMetadata` + `fieldMetadata`
(copy incl. `translations`, drop old column), + `isActive` default handling + no-change assertion. ~60–100 LOC.

### Mocks — ~22 files (mechanical)
`flat-object-metadata/__mocks__/*` (~11), `flat-field-metadata/__mocks__/*` (~11), a couple graphql mocks —
rename `standardOverrides`→`overrides`. Pure find/replace.

### Tests — ~6–8 files
Consolidate the two big resolve specs (`resolve-object/field-metadata-standard-override.util.spec.ts`, ~1,300
lines combined) into the unified resolver spec; extend `sanitize-overridable-entity-input.util.spec.ts`;
update `successful-update-one-standard-object/field-metadata.integration-spec.ts`; add parity + migration tests.

### Front-end — ~3–6 files
Regenerate `twenty-front/src/generated-metadata/graphql.ts` + `twenty-client-sdk` types; update the
Settings → Data-Model **rename-label** UI (the main real consumer of `standardOverrides`) to write `overrides`.
Sized ~50–150 LOC; the break is accepted per the product call.

## G. Testing

- **Parity (the crux):** new `resolveEffectiveEntity` == old resolvers for the full U0 corpus, incl.
  every locale, `isStandardApp` branch, icon/color special-casing, translation precedence, and empty-vs-
  partial-vs-full overrides. A single mismatch blocks the switch.
- **Write parity:** generalized `sanitize…` produces byte-identical `overrides`/`standardOverrides`
  blobs to the old writers for the corpus (add/remove/null-collapse semantics).
- **Migration correctness (U3):** for every object/field row, post-migration `overrides` resolves to the
  same effective labels/translations as pre-migration `standardOverrides`; `isActive` unchanged for all
  rows; round-trip through the GraphQL alias equals the pre-migration API response.
- **i18n:** translations survive the migration and resolve identically per locale; app-translation-sync
  + workspace presentation override do not double-apply.
- **Reconcile:** a workspace-config presentation override on a standard object and on a view both apply
  through the one path; managed drift detection is uniform (`08` C3).
- **Hot-path perf:** object/field resolve is called on every metadata read — assert the unified resolver
  is no slower than today (benchmark against U0 corpus; the flat-spread fast path must be preserved for
  non-translatable entities).

## H. Risks specific to this PR

| Risk | Sev | Mitigation |
|------|-----|-----------|
| i18n/translation regression (subtle precedence) | High | `c1` golden corpus + exact parity gate; per-locale migration test |
| GraphQL breaking change on `standardOverrides` | **Accepted** | Product call: negligible external usage → clean removal, no alias. The one real consumer is the Settings rename-label UI, updated in `c6`. Regenerate front/client-SDK types |
| Big-PR reviewability (large blast radius: ~22 mocks + regen) | Med | Commit-structured (§F, `c1`–`c6`); reviewers go commit-by-commit; mocks/regen isolated to `c5`/`c6` |
| `isActive` default flip (false→true) on object/field | Med | Explicit default override + no-change assertion in the migration (D.3) |
| Hot-path perf regression on object/field resolve | Med | Preserve the flat-spread fast path; benchmark; no i18n work for non-translatable props |
| Double-applied translations (app-sync + override) | Med | Single merge point in the unified resolver; test G |
| Losing the anonymous-blob limitation silently | Low | Explicitly documented as unchanged (`03` §B); not "fixed" here |

## I. Definition of done

One `overrides` concept, in **one PR** (`c1`–`c6`): one registry-derived overridable set (facet +
translatable), one write util, one i18n-aware resolve util (a strict superset), object/field storage
migrated to `overrides` (translations preserved, `isActive` default unchanged), the reconciler
de-special-cased, `standardOverrides` **removed** (GraphQL + front-end updated), and the whole parity +
migration + i18n + perf suite green.
