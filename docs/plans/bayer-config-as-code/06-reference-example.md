# 06 — Reference Example: `bayer-twenty/` End-to-End

A concrete, coherent walkthrough of the whole system for one realistic slice: a **Study** object in
the core app, a GxP field, a record page, the **Company → Organization** rename, and a **Germany-only
GxP checklist widget** placed on the core Study page in `prod-eu` only. Every file is illustrative
(not exhaustive) and typed against the real manifest types.

Legend: **✅** existing `twenty-sdk`, **🆕** new `twenty-sdk/config`.

> ## ⚠️ Review-hardened API corrections (read first)
> An adversarial pass found the illustrative snippets below drift from the real SDK types. The
> **authoritative** forms are:
>
> - **Imports:** from `twenty-sdk/define` (not bare `twenty-sdk`); standard ids from `twenty-sdk/define`
>   / `twenty-shared/metadata` (there is no `twenty-sdk/standard-ids`).
> - **`defineApplication`:** fields are `universalIdentifier`, `displayName`, `description` (**required**).
>   There is **no** `name`, `version`, or `dependsOn` on the manifest. The install matrix must key on
>   `universalIdentifier`; **version lives on the `Application` entity (derived from `package.json`)**, not
>   the manifest — the plan's `defineInstall`/`defineInstance` `version` pins resolve against that, and
>   `dependsOn` must be modeled server-side or omitted. *(Open item — see `09` §A / `03` §H.)*
> - **`defineObject`:** requires a `fields: ObjectFieldManifest[]` array; standalone `defineField` needs
>   `objectUniversalIdentifier` (shown).
> - **`defineField`:** `type` is the **`FieldType` enum**, not a string literal → `type: FieldType.SELECT`.
>   Each SELECT option's `color` is **required** and must be a `TagColor` member.
> - **`defineCommandMenuItem`:** **no** `engineComponentKey` and **no** `position` fields; ordering is
>   `isPinned?`. `frontComponentUniversalIdentifier` is **required**. `availabilityType` ∈
>   `'GLOBAL' | 'GLOBAL_OBJECT_CONTEXT' | 'RECORD_SELECTION' | 'FALLBACK'`; the object ref field is
>   `availabilityObjectUniversalIdentifier`.
> - **`defineFrontComponent`:** takes `name` + `component: React.ComponentType` (the CLI builds it →
>   `builtComponentChecksum`); it does **not** take `componentName`/`sourceComponentPath`.
> - **`STANDARD_OBJECT.company`** is an object; use `STANDARD_OBJECT.company.universalIdentifier` as a key.
> - **viewField** refs are `fieldMetadataUniversalIdentifier` / `viewFieldGroupUniversalIdentifier`
>   (no `…Id`); `position` is required.
> - **Widget placement ≠ front component** (see the corrected §5 below): a `pageLayoutWidget` has its own
>   `universalIdentifier`, is **nested under its tab** (`PageLayoutTabManifest.widgets[]`, there is no flat
>   `pageLayoutWidgets` collection and no `pageLayoutTab` field), and references the component via
>   `configuration.frontComponentUniversalIdentifier`.
> - **`universalIdentifier` values must be real UUIDs** (columns are `type: 'uuid'`, `@IsUUID()`); the
>   `'…-phase'` placeholders below are illustrative only.
>
> The snippets below are kept for narrative; where they conflict with this box, **this box wins**.

---

## 0. Shared stable IDs — `apps/core/universal-ids.ts` ✅

```ts
export const CORE_APP = '3f1c0a10-0000-4a00-a000-000000000001';

export const STUDY = {
  object: '9b1e0e2a-0000-4a00-a000-0000000000a1',
  fields: { phase: 'a1000000-…-phase', status: 'a2000000-…-status' },
  viewFields: { phase: 'c3000000-…-vf-phase', status: 'c4000000-…-vf-status' },
  views: { kanban: 'd5000000-…-kanban', legacyTable: 'd6000000-…-legacy' },
  layout: {
    record: 'e7000000-…-rec',
    tabs: { overview: 'f8000000-…-ov', sites: 'f9000000-…-sites' },
  },
  commands: { exportGxp: 'aa000000-…-export-gxp' },
} as const;
```

## `apps/country-de/universal-ids.ts` ✅

```ts
export const COUNTRY_DE_APP = '3f1c0a10-0000-4a00-a000-0000000000de';
export const DE = {
  objects: { gxpChecklist: 'b0de0000-…-gxp-checklist' },
  widgets: { gxpChecklist: 'b1de0000-…-gxp-widget' },
} as const;
```

---

## 1. Core app definitions

### `apps/core/twenty-app.config.ts` ✅
```ts
import { defineApplication } from 'twenty-sdk';
import { CORE_APP } from './universal-ids';

export default defineApplication({
  universalIdentifier: CORE_APP,
  name: 'bayer-core',
  displayName: 'Bayer Core',
  version: '1.4.0',
});
```

### `apps/core/objects/study.object.ts` ✅
```ts
import { defineObject, defineField } from 'twenty-sdk';
import { STUDY } from '../universal-ids';

export const study = defineObject({
  universalIdentifier: STUDY.object,
  nameSingular: 'study',
  namePlural: 'studies',
  labelSingular: 'Study',            // DEFINITION default label (workspace may re-present)
  labelPlural: 'Studies',
  icon: 'IconFlask',
});

export const phase = defineField({
  universalIdentifier: STUDY.fields.phase,
  objectUniversalIdentifier: STUDY.object,
  type: 'SELECT',
  name: 'phase',
  label: 'Phase',
  options: [
    { value: 'PHASE_I',  label: 'Phase I',  position: 0, color: 'blue' },
    { value: 'PHASE_II', label: 'Phase II', position: 1, color: 'green' },
    { value: 'PHASE_III',label: 'Phase III',position: 2, color: 'orange' },
  ],
});

export const status = defineField({
  universalIdentifier: STUDY.fields.status,
  objectUniversalIdentifier: STUDY.object,
  type: 'SELECT', name: 'status', label: 'Status',
  options: [
    { value: 'PLANNED',  label: 'Planned',  position: 0, color: 'gray' },
    { value: 'ACTIVE',   label: 'Active',   position: 1, color: 'green' },
    { value: 'CLOSED',   label: 'Closed',   position: 2, color: 'red' },
  ],
});
```

### `apps/core/seeds/page-layouts/study-record.ts` ✅ (app *proposes* a default layout)
```ts
import { definePageLayout, definePageLayoutTab } from 'twenty-sdk';
import { STUDY } from '../../universal-ids';

export const studyRecordLayout = definePageLayout({
  universalIdentifier: STUDY.layout.record,
  objectUniversalIdentifier: STUDY.object,
  name: 'Study Record',
  type: 'RECORD_PAGE',
});

export const overviewTab = definePageLayoutTab({
  universalIdentifier: STUDY.layout.tabs.overview,
  pageLayoutUniversalIdentifier: STUDY.layout.record,
  title: 'Overview',          // seed default position 1; workspace base reorders it to 0 (see §6 plan)
  position: 1,
});

export const sitesTab = definePageLayoutTab({
  universalIdentifier: STUDY.layout.tabs.sites,
  pageLayoutUniversalIdentifier: STUDY.layout.record,
  title: 'Sites',
  position: 1,
});
```

### `apps/core/seeds/command-menu/export-gxp.ts` ✅
```ts
import { defineCommandMenuItem } from 'twenty-sdk';
import { STUDY } from '../../universal-ids';

export const exportGxp = defineCommandMenuItem({
  universalIdentifier: STUDY.commands.exportGxp,
  engineComponentKey: 'FRONT_COMPONENT_RENDERER',   // DEFINITION — app-owned, not overridable
  frontComponentUniversalIdentifier: '…-export-gxp-component',
  label: 'Export GxP dossier',                       // seed default label (presentation)
  position: 0,                                       // seed default position (arrangement)
  availabilityType: 'GLOBAL_OBJECT',
  availabilityObjectMetadataUniversalIdentifier: STUDY.object,
});
```

---

## 2. Germany app: a GxP checklist widget

### `apps/country-de/twenty-app.config.ts` ✅
```ts
import { defineApplication } from 'twenty-sdk';
import { COUNTRY_DE_APP } from './universal-ids';

export default defineApplication({
  universalIdentifier: COUNTRY_DE_APP,
  name: 'bayer-country-de',
  displayName: 'Bayer Germany',
  version: '2.1.0',
  dependsOn: ['bayer-core'],           // extension of core
});
```

### `apps/country-de/components/gxp-checklist.widget.ts` ✅
```ts
import { defineFrontComponent } from 'twenty-sdk';
import { DE } from '../universal-ids';

export const gxpChecklistWidget = defineFrontComponent({
  universalIdentifier: DE.widgets.gxpChecklist,   // DEFINITION — owned by country-de
  componentName: 'GxpChecklist',
  sourceComponentPath: './src/gxp-checklist.tsx',
});
```

Note: the widget **definition** is owned by `country-de`. Where it is *placed* is a workspace-owned
arrangement decision, made per instance in §5 — this is the cross-app-owned case.

---

## 3. Environment registry — `environments.ts` 🆕

```ts
import { defineEnvironments } from 'twenty-sdk/config';

export default defineEnvironments({
  dev:       { url: 'https://dev.bayer.twenty.app',     tier: 'dev',     region: 'eu', mode: 'self-serve' },
  staging:   { url: 'https://staging.bayer.twenty.app', tier: 'staging', region: 'eu', mode: 'managed' },
  'prod-eu': { url: 'https://eu.bayer.twenty.app',      tier: 'prod',    region: 'eu', mode: 'managed' },
  'prod-us': { url: 'https://us.bayer.twenty.app',      tier: 'prod',    region: 'us', mode: 'managed' },
}, {
  promotionOrder: ['dev', 'staging', 'prod-eu', 'prod-us'],
  auth: (name) => ({ tokenEnv: `TWENTY_TOKEN_${name.toUpperCase().replace(/-/g, '_')}` }),
});
```

---

## 4. Workspace **base** (shared by all instances) 🆕

### `workspace/base/install.ts`
```ts
import { defineInstall } from 'twenty-sdk/config';
export default defineInstall({ apps: [{ name: 'bayer-core', version: '^1.4.0' }] });
```

### `workspace/base/activation.ts`
```ts
import { defineActivation } from 'twenty-sdk/config';
import { STUDY } from '../../apps/core/universal-ids';

export default defineActivation({
  [STUDY.views.kanban]:      true,
  [STUDY.views.legacyTable]: false,   // ship-but-disabled, workspace-wide, as code
  [STUDY.commands.exportGxp]: true,
});
```

### `workspace/base/presentation/objects.ts`  — **Company → Organization**
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

### `workspace/base/arrangement/study-record-page.ts`
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

---

## 5. Overlays (per-instance deltas) 🆕

### `workspace/overlays/prod-eu/instance.ts`
```ts
import { defineInstance } from 'twenty-sdk/config';
export default defineInstance({
  extends: 'base',
  install: [
    { name: 'bayer-core',       version: '1.4.0' },
    { name: 'bayer-country-de', version: '2.1.0' },
    { name: 'bayer-country-fr', version: '2.0.1' },
  ],
});
```

### `workspace/overlays/prod-us/instance.ts`
```ts
import { defineInstance } from 'twenty-sdk/config';
export default defineInstance({
  extends: 'base',
  install: [
    { name: 'bayer-core',       version: '1.4.0' },
    { name: 'bayer-country-us', version: '1.0.3' },   // DE/FR absent → not installed here
  ],
});
```

### `workspace/overlays/prod-eu/arrangement/study-de-widgets.ts` — cross-app placement, EU only
```ts
import { defineArrangement } from 'twenty-sdk/config';
import { STUDY } from '../../../apps/core/universal-ids';
import { DE } from '../../../apps/country-de/universal-ids';

// Corrected model: the PLACEMENT is a distinct workspace-owned entity with its OWN id,
// attached to a tab, referencing the country-de COMPONENT via `configuration`.
export default definePlacement({                       // 🆕 distinct from defineArrangement (reorder)
  widgets: [
    {
      universalIdentifier: STUDY.layout.widgets.gxpChecklistPlacement, // NEW placement id (workspace-owned)
      pageLayoutTabUniversalIdentifier: STUDY.layout.tabs.overview,     // SURFACE owned by core (a commons)
      title: 'GxP Checklist',
      type: 'FRONT_COMPONENT',
      gridPosition: { row: 0, column: 1, rowSpan: 1, columnSpan: 1 },   // required on create
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier: DE.widgets.gxpChecklist,     // DEFINITION owned by country-de
      },
    },
  ],
});
```
> **Design note (open):** the SDK today has **no `definePageLayoutWidget` helper** — widgets are authored
> *nested under* `definePageLayoutTab`. Placing a widget onto a **foreign** tab from a workspace overlay
> therefore needs a real decision: either a new `definePlacement`/`definePageLayoutWidget` helper that
> targets a tab by `universalIdentifier` (shown above), or a nested authoring surface. This is the
> "create net-new placement on a surface you don't own" case; it is distinct from `defineArrangement`
> (which only *reorders/repositions existing* placements). Tracked in `04` §B.4 and `09`.

### `workspace/overlays/prod-eu/presentation/objects.ts` — EU-only relabel on top of base
```ts
import { definePresentation } from 'twenty-sdk/config';
import { STUDY } from '../../../apps/core/universal-ids';
export default definePresentation({
  [STUDY.object]: { labelSingular: 'Clinical Study (EU)' },   // shadows base for prod-eu only
});
```

### `workspace/overlays/dev/values.ts` and secrets
```ts
import { defineValues, secretRef } from 'twenty-sdk/config';
export default defineValues({
  'bayer-core': {
    SALESFORCE_SYNC_ENABLED: 'false',
    DEFAULT_LOCALE: 'en-US',
    SALESFORCE_CLIENT_SECRET: secretRef('SALESFORCE_CLIENT_SECRET'),  // value in secrets.sops.yaml
  },
});
```
```yaml
# workspace/overlays/prod-eu/secrets.sops.yaml  (SOPS-encrypted)
bayer-core:
    SALESFORCE_CLIENT_SECRET: ENC[AES256_GCM,data:9f2c…,tag:…]
```

---

## 6. What `twenty config plan --instance prod-eu` prints (illustrative)

```
Plan for instance prod-eu (tier=prod, mode=managed)
Apps: bayer-core@1.4.0, bayer-country-de@2.1.0, bayer-country-fr@2.0.1

~ presentation  object company            labelSingular  "Company" → "Organization"
~ presentation  object company            labelPlural    "Companies" → "Organizations"
+ presentation  object company            translations   de-DE, fr-FR
~ presentation  object study              labelSingular  "Study" → "Clinical Study (EU)"   (overlay)
~ arrangement   pageLayoutTab overview    position       1 → 0
+ arrangement   pageLayoutWidget gxp       tab=overview   grid(0,1)  owner=bayer-country-de  (cross-app)
~ activation    view study.legacyTable     isActive       true → false

Definitions: 0 changes  (no app upgrade)
Managed drift: none
Foreign-owned definitions touched: 0    ✅ ownership invariant holds
```

Apply on `prod-us` would show **no** `gxp` widget and **no** `country-de` items — that app is not in
its install matrix.

---

## 7. What this demonstrates

- **Definitions** (Study object, GxP fields, the widget component) come from apps; **activation /
  arrangement / presentation** come from the workspace layer — all as code.
- **Company → Organization** is a `presentation` override in the workspace base, applied everywhere,
  never an app mutation.
- **A country widget on a core surface** is a cross-app-owned placement in one overlay only.
- **Per-country install** is the overlay's install matrix; absent app ⇒ absent everywhere it isn't
  listed.
- The **plan** proves the ownership invariant on every apply (zero foreign-definition writes).
