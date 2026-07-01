# 01 — The Ownership Model (Facets, Surfaces, Lifecycle)

This is the conceptual foundation everything else depends on. It exists to make ownership a
**mechanical classification**, not a per-metadata-type product debate.

## The problem it solves

"Should a command menu item be app-owned or workspace-owned?" has **no answer**, because a
command menu item is not one thing — it is a bundle of properties, each of which belongs to a
different owner *by its nature*. Asking the question per entity forces an endless series of
product discussions (does a page-layout tab belong to the app or the workspace? a section? a
widget? a field placement?). We replace that with a single rule applied to **properties**.

## The four facets

Every property of every metadata entity belongs to exactly one facet. Run the tests **in
order**; first hit wins.

| Facet | The test (ask about the property) | Owner | Upgrade / reconciliation behaviour |
|-------|-----------------------------------|-------|------------------------------------|
| **Definition** | "If this changed, would it become a *different thing*, or would the app's code break?" | **App** | App-authored; upgrade overwrites; removed on uninstall. Not workspace-writable. |
| **Activation** | "Is this the workspace saying *'I want this here or not'*?" (on/off/visible/enabled) | **Workspace** | `isActive`. App ships a default; never re-imposed on upgrade. |
| **Arrangement** | "Is this *where it sits / how it's grouped / ordered* — identity unchanged?" | **Workspace** | Override layer. App seeds a default; resolved on top; reversible. |
| **Presentation** | "Is this *what it's called / how it looks* — identity unchanged?" | **Workspace** | Override layer. App seeds a default; resolved on top; reversible. |

Ownership collapses to **two owners**: `Definition` → app; `{Activation, Arrangement,
Presentation}` → workspace. We keep four names because Arrangement and Presentation, though
both workspace-owned, are semantically distinct and may deserve different UI, permissions, and
authoring files.

### Why the tests are mechanical (not taste)

Each test keys off an intrinsic property you can answer without product preference:
- **"Removed/broken on uninstall?"** yes ⇒ Definition (app). A placement survives uninstall as
  a danglable reference to clean up; a definition's meaning evaporates.
- **"Do two apps contend for the same slot?"** yes ⇒ it is a shared surface ⇒ Arrangement
  (workspace). Contention is the tell that something is a commons.
- **"Does it change what the thing *is*, or how it *looks / where it sits*?"** looks/where ⇒
  Presentation/Arrangement (workspace); what-it-is ⇒ Definition (app).

The only residual judgement is the rare **true-binding tiebreaker** (e.g. "which page does this
command open?"), resolved by one question — *"does changing it break the app's contract?"* yes ⇒
Definition; no ⇒ Arrangement — and recorded with a one-line rationale in the facet registry.

## The key reframe: classify properties, not entities

An installable entity is **co-owned by construction**. The app owns its Definition facet; the
workspace owns its Activation/Arrangement/Presentation facets. Twenty's `OverridableEntity`
(base columns + `isActive` + `overrides`) already encodes exactly this tri-partition — the plan
just makes the partition explicit and enforced (see `03-target-architecture.md`).

## Surfaces are commons

The hardest cases ("a widget on a page layout I don't own", "a tab I don't own") dissolve with a
single upstream decision instead of per-element debate:

> **A surface (page layout, record page, command menu, navigation) is a workspace-owned
> commons. Everything *placed on* it is Arrangement → workspace. Apps own the *pieces*
> (component / field / command definitions) and ship *seed placements*.**

Because a page layout is a shared surface, its arrangement — which widgets, in which sections,
in which tabs, in which order — is workspace state by the Arrangement test. So:

- The **widget** (front component) → app-owned Definition.
- The **placement** of that widget (tab, section, grid position) → Arrangement → workspace-owned,
  app-seeded.

"Can app B add a widget to app A's page?" → B contributes a component *definition* (owned by B)
plus a *seed placement* into the workspace's arrangement of that page. The live placement is
workspace state; on B's uninstall its definition is removed and dangling placements are pruned,
but the page (owned by the workspace/A) survives. **One rule — "surfaces are commons" — answers
tabs, sections, widgets, and field placements at once.**

### Ownership follows authorship of the *contribution*, not of the *container*

A field you add to another app's object is **your app's** field (attributed to you, upgrades with
you, removed on your uninstall) — *not* a workspace customization. A "workspace customization" is
specifically the **un-attributed** layer: intent expressed by the workspace owner (as code, in the
managed model) that shadows display/arrangement without changing identity.

## The lifecycle: seed → upgrade → uninstall

This reconciles "an app *proposes* / the workspace *owns*":

- **Install (seed).** Copy the app's seed (default `isActive` + default Arrangement/Presentation)
  into the workspace layer as the initial live state.
- **Upgrade.** Update **Definition** facets in place (app-authored). **Never** overwrite
  workspace-owned facets (`isActive`, `overrides`). New installs receive the new seed; existing
  workspaces keep their live state. (This mirrors Salesforce's subscriber-editable-property rule
  and Twenty's existing `WasIntroducedInUpgrade` machinery.)
- **Uninstall.** Remove the app's Definition facets; prune dangling placements that referenced
  them; garbage-collect overrides that shadowed them.

### Two modes of the workspace layer

The *ownership* of the workspace layer is constant; the *authoring modality and authority* differ
by instance mode:

| Mode | Who authors the workspace layer | Authority | For |
|------|-------------------------------|-----------|-----|
| **Self-serve** | Admin clicks in the UI (seed as starting point) | The workspace (UI) wins; app upgrade won't clobber | Sandboxes, SMB, trials |
| **Managed** | Code in the config repo (`workspace/**`) | The repo wins; UI edits locked / reported as drift | Bayer prod/staging; any regulated instance |

Bayer runs **managed** mode. "Workspace-owned" therefore means *the workspace layer is the
authority* — it does **not** mean "must be clicked". See `03-target-architecture.md` for the
managed-mode + drift mechanics.

## Worked classification — real Twenty entities

Applying the facet test to properties that exist today (grounded in the entity definitions and
the property registry). This is the *mechanical* output of the rule, and it doubles as the target
state for the facet-tagging work in `03`/`07`.

### `commandMenuItem`
| Property | Facet → Owner | Note |
|----------|---------------|------|
| `engineComponentKey`, `frontComponentId`, `workflowVersionId`, `payload` | Definition → app | This *is* the command. **Today `engineComponentKey` is wrongly marked overridable** — a bug the facet lens exposes. |
| `isActive` | Activation → workspace | Already a first-class column. |
| `position`, `isPinned`, `hotKeys` | Arrangement → workspace | Placement in the menu. |
| `label`, `icon`, `shortLabel` | Presentation → workspace | Display. |
| `availabilityType`, `availabilityObjectMetadataId`, `pageLayoutId` | **Tiebreaker** | Binding/retarget vs. identity — decide with the "breaks the contract?" test; record rationale. |

### `pageLayoutWidget`
| Property | Facet → Owner |
|----------|---------------|
| `type`, `objectMetadataId`, `configuration`, `gridPosition` | Definition → app (what the widget *is*) |
| `isActive` | Activation → workspace |
| `position`, `pageLayoutTabId` | Arrangement → workspace |
| `title` | Presentation → workspace |
| `conditionalDisplay`, `conditionalAvailabilityExpression` | Definition (behavior) → app *(tiebreaker candidate)* |

### `objectMetadata` / `fieldMetadata`
| Property | Facet → Owner |
|----------|---------------|
| `nameSingular`/`namePlural`/`name`, `type`, relations, `settings`, `isSystem` | Definition → app |
| `isActive` | Activation → workspace |
| `labelSingular`/`labelPlural`/`label`, `description`, `icon`, `color`, `translations` | Presentation → workspace (this is where **Company → Organization** lives, via `standardOverrides`) |

(Objects/fields currently express Presentation via a bespoke `standardOverrides` JSONB rather than
`OverridableEntity.overrides`; unifying the two is part of `03`.)

## The smell this model removes

Today the property registry encodes ownership as an **ad-hoc binary** (`isOverridable?: boolean`),
applied inconsistently (e.g. `commandMenuItem.engineComponentKey` marked overridable — a Definition
leak; `availabilityType` overridable while the adjacent `conditionalAvailabilityExpression` is not,
with no stated reason). That inconsistency *is* the "no clear line" pain. Replacing the binary with a
required **`facet`** (from which `isOverridable` is *derived*) makes the classification explicit,
uniform, and compiler-enforced — and forces every new property through the four-way test.

## The rule, as guidance for humans

> Stop asking "who owns this metadata type." Ask, per property, "which facet."
> **Definition** = the app. **Activation + Arrangement + Presentation** = the workspace
> (the app only seeds defaults). **Surfaces are commons**: you own the pieces you place, never
> the arrangement of someone else's surface, and you never edit another owner's definition in place.

Mental model for end users:
> **Apps ship Lego bricks and a suggested build. Your workspace is the actual build. Inventing a
> brick is an app. Turning it on, where it sits, and what it's called is your workspace — and for
> Bayer, "your workspace" is a Git repo.**
