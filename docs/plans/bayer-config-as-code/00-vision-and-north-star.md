# 00 — Vision & North Star

## The dream, in one paragraph

A central platform team manages Bayer's entire Twenty estate — dozens of objects, hundreds
of fields, functions, page layouts, views, the command menu, navigation, labels and
translations — for many regional instances, **entirely from a Git repository**. A change
starts as a pull request, is reviewed by the right owners, is shown as a precise diff
against each target instance by CI, and is promoted `dev → staging → prod` with recorded
approvals. Country teams own their country apps and can ship independently without touching
the core. Nothing is ever clicked into a production workspace; if someone does, CI reports
it as drift and the next apply reverts it. Any instance can be rebuilt from scratch out of
Git. The whole system is auditable end-to-end, which is what makes it acceptable in a GxP
regulated environment.

## Why this matters for a regulated life-sciences enterprise

Bayer is not a generic SaaS customer. The requirements below are not "nice to have"; several
are effectively regulatory obligations (GxP, Computer System Validation / CSV, EU Annex 11,
US 21 CFR Part 11). The plan is designed to satisfy them structurally, not by bolting on
process afterward.

| Driver | What it demands of the platform | How this plan delivers it |
|--------|--------------------------------|---------------------------|
| **Change control** | Every configuration change is proposed, reviewed, approved, and traceable to a person and a reason. | Config is code; PRs are the change-control record; CODEOWNERS enforce approver roles. |
| **Reproducibility / CSV** | The exact configuration of a validated instance can be reproduced and re-validated. | Instances are deterministic functions of pinned Git state (apps@version ⊕ workspace config). |
| **Separation of duties** | The person who authors a change is not necessarily the one who approves/promotes to prod. | Author (PR) vs. approver (CODEOWNERS) vs. promoter (protected environment + required reviews). |
| **Auditability (Part 11)** | A durable, tamper-evident record of *what changed, when, by whom, why*. | Git history + signed commits + CI apply logs + the server-side Setup-audit trail on apply. |
| **Environment integrity** | `prod` cannot silently diverge from what was validated. | Managed mode locks UI edits of managed facets; drift is detected and reverted on apply. |
| **Disaster recovery** | An instance can be rebuilt to a known-good state. | `twenty deploy` from a pinned commit rebuilds the full metadata surface of an instance. |
| **Least privilege** | Country teams touch only their country app; nobody edits another owner's definitions. | Facet ownership + cross-app write enforcement (see `03-target-architecture.md`). |

## Personas

- **Platform Engineer (central).** Owns `apps/core`, `workspace/base`, the environment
  registry, and the CI pipelines. Thinks in Terraform/Argo terms. Wants `plan` output on
  every PR and confident, reversible `apply`.
- **Country App Developer (e.g. Germany, US, Japan).** Owns `apps/country-XX`. Ships local
  objects/fields/functions and *proposes* local arrangement. Must be able to release on
  their own cadence without a core release, and must be unable to break core or other
  countries.
- **Business Admin / Config Owner.** Owns the *meaning* of the workspace layer: what a
  field is called ("Company" → "Organization"), which views are default, tab order. On
  managed instances they express intent **as code via reviewed PRs**, not clicks. On
  self-serve instances (e.g. a sandbox) they may click, and can later "adopt" changes into
  code.
- **QA / Validation Lead.** Needs evidence that `staging` and `prod` match what was tested;
  needs a signed record of the promotion. Consumes CI `plan` diffs and apply logs.
- **Auditor / Regulator.** Occasionally needs to answer "who changed the label of this
  field on the EU production instance on this date and who approved it?" — answerable from
  Git + CI logs alone.

## What "the very end experience" looks like — a day in the life

### Scenario A: The central team renames an object and reorders a page, globally
1. A platform engineer opens a PR editing `workspace/base/presentation/objects.ts`
   (Company → Organization, with `de-DE`/`fr-FR` translations) and
   `workspace/base/arrangement/company-record-page.ts` (move the "Contacts" tab to
   position 0).
2. CI runs `twenty deploy --dry-run` against `dev`, `staging`, `prod-eu`, `prod-us` and
   posts four diffs to the PR. Each diff shows exactly which `presentation`/`arrangement`
   overrides will be created/updated, keyed by `universalIdentifier`, and confirms **no
   definition-facet or foreign-owned metadata is touched**.
3. CODEOWNERS require the platform lead's approval for `workspace/base/**`.
4. On merge, CI applies to `dev` automatically. Promotion to `staging` then `prod` is a
   protected-environment gate with a required reviewer and a recorded approval.
5. The label changes everywhere; no workspace was clicked; the audit trail is the PR.

### Scenario B: Germany ships a new GxP checklist widget, EU-only
1. A Germany developer adds a `defineFrontComponent` widget and a `defineObject` for the
   checklist in `apps/country-de`, bumps `country-de` to `2.1.0`, and opens a PR.
2. They place the widget on the **core-owned** Study record page via
   `workspace/overlays/prod-eu/arrangement/…` — a *cross-app-owned* placement: the widget
   definition is owned by `country-de`, the placement is workspace-owned arrangement in the
   EU overlay. (This cross-app-owned case is already exercised by Twenty's integration
   tests.)
3. `prod-us`'s overlay does not reference `country-de`, so the US instance is unaffected —
   `country-de` is not even in its install matrix.
4. CI `plan` shows the widget appearing only on `prod-eu`. Promotion proceeds independently
   of any core release.

### Scenario C: A production drift is caught
1. Someone with UI access toggles a view off directly in `prod-eu` during an incident.
2. The nightly `twenty deploy --dry-run` job reports drift: the live `isActive` no longer
   matches the code-declared `activation.ts`.
3. The platform team either (a) reverts by re-applying, or (b) codifies the change with a
   PR. Either way the divergence is visible and resolved through Git, never silently
   accumulated.

### Scenario D: Rebuild an instance from zero (DR / new region)
1. Bayer stands up a new region `prod-apac`. A platform engineer copies an overlay, sets
   the install matrix (`core`, `country-jp`), and points it at the fresh instance URL.
2. `twenty deploy --instance prod-apac` installs the pinned app versions and applies the
   full workspace config. The new instance reaches a known, validated state with no manual
   steps.

## Success criteria (how we know we're done)

A build is "the end-state Bayer is dreaming of" when **all** of the following hold:

1. **Zero-click configuration.** 100% of the objects/fields/functions/layouts/views/
   command-menu/navigation/labels/translations/install-set/env-values needed by Bayer can
   be expressed as code. No configuration task requires clicking in a managed instance.
2. **Deterministic instances.** `hash(pinned apps ⊕ workspace config)` fully determines an
   instance's metadata. Two applies of the same commit are a no-op the second time
   (idempotent), and `plan` on an unchanged commit shows an empty diff.
3. **Safe, reviewable promotion.** `dev → staging → prod` promotion is a version-pin bump
   in Git, gated by CODEOWNERS + protected environments, with a machine-readable `plan`
   diff attached to each promotion.
4. **Enforced ownership.** An app cannot mutate another app's definitions; the workspace
   layer cannot rewrite definitions; every property's owner is derivable from its facet and
   checked at the mutation boundary.
5. **Managed mode + drift.** On managed instances, UI edits of managed facets are blocked or
   reported; `plan` surfaces any divergence; `apply` reconciles it.
6. **Cross-instance portability.** The same file applied to any instance resolves to the
   same entities via `universalIdentifier`; no per-instance UUIDs appear in the repo.
7. **Multi-owner scale.** Central and N country teams work in parallel with clear CODEOWNERS
   boundaries; a country release does not require a core release and cannot break core.
8. **Auditability.** For any change on any instance we can answer *what/when/who/why/approved-
   by* from Git + CI logs, and produce it as CSV/validation evidence.
9. **Reproducibility / DR.** A brand-new instance can be brought to a validated state purely
   from a pinned commit, no manual steps.
10. **Great DX.** Authoring is typed end-to-end (configs typed against the real manifest
    types), `plan` is fast and legible, errors are caught at build/plan time not at apply
    time, and a local sandbox loop exists (`twenty dev`).

## Explicit non-goals (for this plan)

- **Record-level data** (actual CRM rows) is *not* managed by this system — only metadata
  and configuration. Data seeding/fixtures are a separate concern (noted in
  `09-risks-and-open-questions.md`).
- **Per-user preferences** (a single user's personal view tweaks) remain user-scoped and are
  out of scope for the managed workspace layer.
- **Replacing Twenty's existing app/manifest system.** This plan *extends* it; it does not
  fork or rewrite the reconciliation engine.

## North-star metric

**"Time-to-validated-change in production, with a full audit trail, without a single click."**
Today (clickops): hours-to-days, non-reproducible, weak audit trail. Target: a reviewed PR
that promotes through environments in minutes of pipeline time, fully reproducible, with the
audit trail produced automatically.
