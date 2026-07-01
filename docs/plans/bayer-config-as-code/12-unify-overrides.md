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
- **Recommendation — phased B1 with a compatibility shim:**
  - **D.1** Introduce the unified **resolve** + **write** utils first (behavior-preserving), driving both
    columns. No storage change yet. (Parity-tested — §F.)
  - **D.2** Migrate storage: object/field adopt the shared `overrides` column; **keep `standard
    Overrides` as a GraphQL-exposed, resolved alias** (a virtual field computed from `overrides`) for a
    deprecation window, so the API doesn't break. Data migration copies `standardOverrides` → `overrides`
    (preserving `translations`).
  - **D.3** Resolve the `isActive` default: object/field keep **default `false`** explicitly (do not
    inherit `OverridableEntity`'s `true`); if adopting `OverridableEntity`, override the column default,
    and add a migration assertion that no existing row's `isActive` changed.
  - **D.4** After the deprecation window, drop the `standardOverrides` alias (separate, announced PR).
- **B2 is the fallback** if D.2's storage migration proves too risky for the timeline: keep the
  `standardOverrides` column but make it a **facet-typed projection** the unified resolver understands,
  so read/write/registry are unified even though two column names persist. Lower reward, lower risk.

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

## F. PR sequence (de-risking discipline — characterize before you change)

Each step is independently shippable; the first two are inert/behavior-preserving.

- **U0 — Characterization + parity harness (test-only, riskless).** Capture golden outputs of both
  resolve utils and both write paths across a corpus (standard + custom objects/fields; all six
  Overridable entities; multiple locales; `isStandardApp` true/false; empty/partial/full overrides).
  This is the safety net for everything below and part of ladder rung A2 (`11`).
- **U1 — Introduce the unified `resolveEffectiveEntity` + generalized `sanitizeOverridableEntityInput`,
  behind the existing call sites (M, low risk).** New utils must reproduce U0 goldens **exactly** (parity
  test asserts new == old for the whole corpus). Swap call sites to the new utils; delete the old three
  resolvers + the bespoke object write branch. No storage change. This alone removes the "two code
  paths."
- **U2 — Registry-drive `standardOverrides` (M, low risk).** Add `facet` + `translatable` to the
  registry for object/field presentation properties; derive the object/field overridable set from the
  registry instead of the hardcoded DTO list; assert the derived set equals today's hardcoded set.
- **U3 — Storage unification + GraphQL alias (L, higher risk).** Object/field adopt the shared
  `overrides` column; keep `standardOverrides` as a resolved GraphQL alias; data migration
  `standardOverrides → overrides` preserving `translations`; explicit `isActive` default handling (D.3)
  with a no-change assertion. Fast/slow instance command.
- **U4 — Reconciler/sync collapse (M).** Replace the two registry/compare entries with one; verify
  universal-flat-entity diff treats `overrides` uniformly; managed-mode drift no longer special-cases
  object/field.
- **U5 — Deprecate & remove the `standardOverrides` alias (S, announced, later).** After the window +
  front-end/client-SDK migration to the unified field.

Dependencies: U0 → U1 → U2 → U3 → U4 → U5. U1 depends on the `facet` annotation (roadmap PR1) for the
registry-typed property sets; U3 depends on PR1/PR2 landing so the facet is authoritative.

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
| i18n/translation regression (subtle precedence) | High | U0 golden corpus + exact parity gate before any switch; per-locale migration test |
| GraphQL breaking change on `standardOverrides` | High | Keep it as a resolved alias through a deprecation window (D.2/U3); coordinate front + client-SDK (`07` FE PR) |
| `isActive` default flip (false→true) on object/field | Med | Explicit default override + no-change assertion in the migration (D.3) |
| Hot-path perf regression on object/field resolve | Med | Preserve the flat-spread fast path; benchmark; no i18n work for non-translatable props |
| Double-applied translations (app-sync + override) | Med | Single merge point in the unified resolver; test G |
| Losing the anonymous-blob limitation silently | Low | Explicitly documented as unchanged (`03` §B); not "fixed" here |

## I. Definition of done

One `overrides` concept: one registry-derived overridable set (facet + translatable), one write util, one
i18n-aware resolve util (a strict superset), object/field storage migrated with a compat alias, the
reconciler de-special-cased, and the whole U0 parity + migration + i18n + perf suite green. `standard
Overrides` remains only as a deprecated GraphQL alias until the announced removal (U5).
