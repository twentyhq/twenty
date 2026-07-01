# 04 — The `twenty-sdk/config` Authoring Layer

This layer is the developer-facing surface for the **workspace-owned** config (the app-owned side
already exists as `twenty-sdk` `define*`). It is deliberately thin: every `define*` here compiles
to a `WorkspaceConfigManifest` (see `03-target-architecture.md` §E), which rides the existing
reconciliation engine. It is typed end-to-end against the real manifest types so mistakes are
caught at build/plan time, not apply time.

Legend: **✅ exists** (`twenty-sdk`), **🆕 new** (`twenty-sdk/config`).

> ## ⚠️ Review-hardened API corrections
> - **`defineActivation` cannot be a bare `Record<UniversalIdentifier, boolean>`.** `isActive` is not
>   uniform (6 types inherit it from `OverridableEntity`; object/field declare their own; `pageLayout` and
>   `navigationMenuItem` have **none**), and a `universalIdentifier` alone doesn't identify the entity
>   *type*. Type activation keys against a **generated union of activatable ids**, or take
>   `{ target, entityType, isActive }`, so `defineActivation` on a non-activatable target is a **compile
>   error** (the §A.2 promise). Verify the target is activatable at build time.
> - **Split reorder from create.** `defineArrangement` should cover **reorder/visibility/size of existing
>   placements** only. Creating a *net-new* placement (e.g. a cross-app widget: new id + `gridPosition` +
>   `configuration`) is a different lifecycle → a distinct **`definePlacement`** (see `06` §5). Bundling
>   both under "arrangement" muddies ownership and hides the non-nullable-`gridPosition`-on-create rule.
> - **`base ⊕ overlay` collection merge is per-property deep-merge, not whole-entry replace** (`03` §F).
>   The examples only set full objects, hiding the trap.
> - **Secrets:** the compiled `WorkspaceConfigManifest` must carry only `{ isSecret: true, ref }`, never a
>   resolved value; `plan --format=markdown` posts to PR comments, so secret and `connectionProvider`
>   values must render as `***`; values are injected only at `apply` time, server-side. Add a test that no
>   `secretRef` resolves before serialization.
> - **`defineEnvironments.auth` should resolve the token now, not return an env-var name** — inject a
>   resolver (`auth: ({ env }) => ({ token: env('TWENTY_TOKEN_…') })`) so missing creds fail fast.
> - **Reproducibility:** existing checksums (`packageJsonChecksum`, `builtComponentChecksum`, …) hash
>   *build outputs* client-side with a non-pinned toolchain and are **not server-verified** — treat them
>   as advisory. Prefer **publish-then-promote a built artifact** over "rebuild from source in prod."

---

## A. Design principles

1. **Typed against reality.** Config types are `Pick`/facet-filtered projections of the real
   `*Manifest` types in `twenty-shared`. If Twenty adds a property, the authoring type updates
   automatically, and the facet registry decides whether it's settable here.
2. **Facet-checked at authoring time.** `defineArrangement` accepts *only* `arrangement`-facet
   properties for the target entity; `definePresentation` only `presentation`-facet; etc. Setting a
   `definition` property is a **type error**, not a runtime rejection. This is enforcement (`03` §C)
   pulled all the way left to the IDE.
3. **Identity by `universalIdentifier`.** Every reference is a stable id; no per-instance UUIDs.
4. **Pure & composable.** Every `define*` returns a plain validated value; `base ⊕ overlay` is a
   pure merge. No I/O at authoring time.
5. **Ergonomic references.** Configs import the app's exported `universal-ids` constants so refs are
   autocompleted and refactor-safe.

---

## B. The authoring API

### B.1 `defineEnvironments` 🆕 — the instance registry

```ts
import { defineEnvironments } from 'twenty-sdk/config';

export default defineEnvironments({
  dev:       { url: 'https://dev.bayer.twenty.app',     tier: 'dev',     region: 'eu', mode: 'self-serve' },
  staging:   { url: 'https://staging.bayer.twenty.app', tier: 'staging', region: 'eu', mode: 'managed' },
  'prod-eu': { url: 'https://eu.bayer.twenty.app',      tier: 'prod',    region: 'eu', mode: 'managed' },
  'prod-us': { url: 'https://us.bayer.twenty.app',      tier: 'prod',    region: 'us', mode: 'managed' },
}, {
  promotionOrder: ['dev', 'staging', 'prod-eu', 'prod-us'],
  // per-instance CI credential resolution; never inline secrets
  auth: (name) => ({ tokenEnv: `TWENTY_TOKEN_${name.toUpperCase().replace(/-/g, '_')}` }),
});
```

Returns a typed registry used by the CLI to target instances and to sequence promotion.

### B.2 `defineInstance` / `defineInstall` 🆕 — install matrix + inheritance

```ts
// workspace/base/install.ts — installed on every instance
import { defineInstall } from 'twenty-sdk/config';
export default defineInstall({
  apps: [{ name: 'bayer-core', version: '^1.4.0' }],
});

// workspace/overlays/prod-eu/instance.ts — per-instance, version-pinned
import { defineInstance } from 'twenty-sdk/config';
export default defineInstance({
  extends: 'base',
  install: [
    { name: 'bayer-core',       version: '1.4.0' },   // pinned in prod
    { name: 'bayer-country-de', version: '2.1.0' },   // country apps only here
    { name: 'bayer-country-fr', version: '2.0.1' },
  ],
});
```

`version` accepts a semver range in `dev` (floats) and an exact pin in `staging`/`prod` (the CLI
warns if a `prod` instance uses a range — reproducibility requires exact pins).

### B.3 `defineActivation` 🆕 — the **activation** facet

```ts
import { defineActivation } from 'twenty-sdk/config';
import { STUDY } from '../../apps/core/universal-ids';

export default defineActivation({
  [STUDY.views.kanban]:       true,
  [STUDY.views.legacyTable]:  false,  // app ships it; turned off workspace-wide, as code
  [STUDY.commands.exportGxp]: true,
});
```

Type: `Record<UniversalIdentifier, boolean>`. Compiles to `activation[]` entries.

### B.4 `defineArrangement` 🆕 — the **arrangement** facet

```ts
import { defineArrangement } from 'twenty-sdk/config';
import { STUDY } from '../../../apps/core/universal-ids';

export default defineArrangement({
  pageLayoutTabs: [
    { universalIdentifier: STUDY.layout.tabs.overview, position: 0 },
    { universalIdentifier: STUDY.layout.tabs.sites,    position: 1 },
  ],
  viewFields: [
    { universalIdentifier: STUDY.viewFields.phase,  position: 0, isVisible: true, size: 120 },
    { universalIdentifier: STUDY.viewFields.status, position: 1, isVisible: true },
  ],
  commandMenuItems: [
    { universalIdentifier: STUDY.commands.exportGxp, position: 10, isPinned: true },
  ],
});
```

The accepted keys per collection are **facet-filtered**: e.g. for `viewFields` you may set
`position`, `isVisible`, `size`, `viewFieldGroupId` (all `arrangement`), but **not** `fieldMetadataId`
(`definition`). Attempting the latter is a compile error.

### B.5 `definePresentation` 🆕 — the **presentation** facet

```ts
import { definePresentation } from 'twenty-sdk/config';
import { STANDARD } from 'twenty-sdk/standard-ids';

export default definePresentation({
  [STANDARD.objects.company]: {
    labelSingular: 'Organization',
    labelPlural: 'Organizations',
    icon: 'IconBuildingSkyscraper',
    translations: {
      'de-DE': { labelSingular: 'Organisation', labelPlural: 'Organisationen' },
      'fr-FR': { labelSingular: 'Organisation', labelPlural: 'Organisations' },
    },
  },
});
```

Accepted properties per target type are exactly that type's `presentation`-facet set
(`labelSingular`, `labelPlural`, `description`, `icon`, `color`, `translations` for objects).

### B.6 `defineValues` / secrets 🆕 — per-instance env values

```ts
// workspace/overlays/dev/values.ts — non-secret application variables, per app
import { defineValues } from 'twenty-sdk/config';
export default defineValues({
  'bayer-core': { SALESFORCE_SYNC_ENABLED: 'false', DEFAULT_LOCALE: 'en-US' },
});
```

Secrets are **never** in `.ts`. They live in `secrets.sops.yaml` (SOPS/age or sealed-secrets),
decrypted only in CI, and injected as `applicationVariable{ isSecret: true }` /
`connectionProvider` oauth configs. `defineValues` may *reference* a secret key by name
(`{ SALESFORCE_CLIENT_SECRET: secretRef('SALESFORCE_CLIENT_SECRET') }`) so the shape is validated
without the value being present.

---

## C. Compilation & validation pipeline

```
authoring files (define*)                         (typed, IDE-checked)
  → build: collect + validate  ────────────────►  per-file validation errors/warnings
      • facet-check every property against the registry
      • resolve universalIdentifier references (dangling ref = error)
      • enforce prod ⇒ exact version pins
  → resolveEffectiveConfig(base ⊕ overlay)  ────►  one WorkspaceConfigManifest per instance
  → hand to WorkspaceConfigSyncService (server, §E.3 of 03)
```

Validation reuses the SDK's existing `createValidationResult` pattern (`define*` already returns
`{ config, errors, warnings }`), so the config layer's DX matches the app layer's exactly.

---

## D. CLI additions (extends the existing `twenty` CLI)

| Command | Status | Purpose |
|---------|--------|---------|
| `twenty app build\|deploy\|install\|publish\|uninstall` | ✅ | App lifecycle (unchanged) |
| `twenty dev` | ✅ | Local authoring loop against a sandbox |
| `twenty config plan --instance <name>` | 🆕 | Compute & print the diff (wraps `deploy --dry-run`); PR-time + drift job |
| `twenty config apply --instance <name>` | 🆕 | Apply workspace-config (+ app install) to an instance; writes audit record |
| `twenty config promote --from <a> --to <b>` | 🆕 | Advance version pins/overlays along `promotionOrder`; opens/updates the promotion PR |
| `twenty config validate` | 🆕 | Build + facet-check all instances without touching any server |
| `twenty config adopt --instance <name>` | 🆕 | Import live (self-serve) workspace state into code (reverse of apply) for onboarding |

`plan`/`apply` accept `--instance all` and fan out across the registry (used by CI).

### D.1 `adopt` — the onboarding bridge

For customers migrating from clickops (or a self-serve sandbox) into managed mode, `adopt` reads the
live instance, extracts the workspace-owned facets, and emits `activation`/`arrangement`/
`presentation` files keyed by `universalIdentifier`. This makes the transition to managed mode a
reviewed PR rather than a hand re-entry — important for Bayer's existing sandboxes.

---

## E. Why this stays thin

Everything above is *authoring sugar + validation* over the `WorkspaceConfigManifest`. The heavy
lifting (universal-flat-entity maps, diff, apply, drift) is the existing engine. The new SDK code is:

- the `define*` config helpers + their facet-filtered types,
- `resolveEffectiveConfig` (pure base⊕overlay merge),
- the `twenty config …` CLI verbs wrapping server calls,
- the SOPS/secret-ref plumbing.

No business logic is duplicated from the server; the SDK never reconciles — it only builds a manifest
and calls the server, exactly as `twenty app deploy` does today.
