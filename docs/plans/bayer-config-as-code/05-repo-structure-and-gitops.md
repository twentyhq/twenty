# 05 — Repo Structure & GitOps

This is what the customer's platform team authors against. It composes the central app and
per-country apps over multiple instances, using `base ⊕ overlay`, version-pinned promotion,
encrypted secrets, and `plan`/`apply` CI — the same discipline they apply to infrastructure.

---

## A. Repository topology

**Recommendation: a single GitOps monorepo** (`bayer-twenty/`) for colocation and atomic PRs, with
apps published as **versioned artifacts** so promotion pins immutable versions. This gives *both*
colocation (a field + its placement + its label in one PR) and immutable, reproducible promotion.

Trade-off vs. polyrepo is discussed in `09-risks-and-open-questions.md`; CODEOWNERS draws the team
boundaries inside the monorepo.

```
bayer-twenty/                              # GitOps monorepo — single source of truth
├── apps/                                  # ── DEFINITION layer (app-owned) — twenty-sdk define* ──
│   ├── core/
│   │   ├── twenty-app.config.ts           # defineApplication({ universalIdentifier, version })
│   │   ├── package.json                   # version = the promotion unit
│   │   ├── universal-ids.ts               # exported stable IDs (the linchpin)
│   │   ├── objects/                       # defineObject / defineField        → definition
│   │   ├── functions/                     # defineLogicFunction               → definition
│   │   ├── components/                    # defineFrontComponent (widgets)    → definition
│   │   ├── roles/                         # defineApplicationRole             → definition
│   │   └── seeds/                         # default arrangement/presentation the app PROPOSES
│   │       ├── page-layouts/  views/  command-menu/  navigation/
│   ├── country-de/                        # per-country app (dependsOn: core)
│   │   ├── twenty-app.config.ts
│   │   ├── universal-ids.ts
│   │   └── objects/  functions/  components/  seeds/
│   ├── country-fr/
│   ├── country-us/
│   └── country-jp/
│
├── workspace/                             # ── WORKSPACE-OWNED layer, as code (twenty-sdk/config) ──
│   ├── base/                              # shared by ALL instances
│   │   ├── install.ts                     # defineInstall — apps everywhere (e.g. core)
│   │   ├── activation.ts                  # defineActivation — isActive per universalIdentifier
│   │   ├── arrangement/                   # defineArrangement — tabs, sections, order, nav
│   │   │   ├── company-record-page.ts
│   │   │   └── study-record-page.ts
│   │   └── presentation/                  # definePresentation — labels, icons, colors, i18n
│   │       ├── objects.ts                 # Company → Organization lives here
│   │       └── fields.ts
│   └── overlays/                          # per-instance deltas:  effective = base ⊕ overlay
│       ├── dev/
│       │   ├── instance.ts                # defineInstance — install matrix + mode
│       │   ├── values.ts                  # non-secret applicationVariable values
│       │   ├── secrets.sops.yaml          # encrypted (connectionProvider oauth, api keys)
│       │   ├── activation.ts              # dev-only activation deltas
│       │   ├── arrangement/               # dev-only arrangement deltas
│       │   └── presentation/              # dev-only presentation deltas
│       ├── staging/
│       ├── prod-eu/
│       │   ├── instance.ts                # install: [core@1.4.0, country-de@2.1.0, country-fr@2.0.1]
│       │   ├── values.ts  secrets.sops.yaml
│       │   ├── activation.ts
│       │   ├── arrangement/study-de-widgets.ts   # cross-app placement (DE widget on core page)
│       │   └── presentation/objects.ts
│       └── prod-us/
│           ├── instance.ts                # install: [core@1.4.0, country-us@1.0.3]
│           └── ...
│
├── environments.ts                        # defineEnvironments — instance registry + promotionOrder
├── .github/
│   ├── workflows/
│   │   ├── plan.yml                        # PR: twenty config plan --instance all → post diffs
│   │   ├── apply-dev.yml                   # merge to main: apply dev
│   │   ├── promote.yml                     # manual/gated: promote along promotionOrder
│   │   └── drift.yml                       # nightly: twenty config plan; alert on managed-drift
│   └── CODEOWNERS
├── package.json                           # workspace: twenty-sdk, twenty-sdk/config, sops
├── tsconfig.json
└── README.md
```

**The folder grammar is the facet model** — `apps/*/objects|functions|components` = definition,
`apps/*/seeds` = proposed defaults, `workspace/**/activation|arrangement|presentation` = the three
workspace-owned facets. New engineers learn the ownership model by reading the tree.

---

## B. `base ⊕ overlay` composition

Effective instance config = `workspace/base` merged with `workspace/overlays/<instance>` (see
`03-target-architecture.md` §F for merge semantics). Only genuine per-instance differences live in
overlays; everything shared lives once in `base`. This is standard Kustomize-style layering the
platform team already knows.

Layer precedence for the *final* effective metadata (lowest → highest), from `03` §E.4:
`twenty-standard-application` → installed apps@version (core, then country) → `workspace/base` →
`workspace/overlays/<instance>`. Higher layers may set only workspace-owned facets on lower-layer
entities.

---

## C. Promotion `dev → staging → prod`

Promotion is **version-pin movement in Git**, gated by review and protected environments.

1. **Author** in `dev` (ranges float to the newest published app versions).
2. **Cut** app releases: `twenty app publish` produces immutable `bayer-core@1.4.0` etc.
3. **Pin** the release in the next tier's overlay (`staging/instance.ts`), open a PR.
4. **`plan`** runs against `staging`; the diff is attached to the PR; CODEOWNERS approve.
5. **Merge** → `apply` to `staging`. Repeat for `prod-eu`/`prod-us`.

`twenty config promote --from staging --to prod-eu` automates the pin-bump PR. Prod overlays require
exact pins (the CLI errors on ranges) so a promoted instance is a deterministic function of the pin.

**Separation of duties:** author (opens PR) ≠ approver (CODEOWNERS) ≠ promoter (protected-environment
required reviewer). This maps directly onto GxP change-control roles.

---

## D. Per-country apps installed on some instances

The install matrix in each overlay's `instance.ts` is the single source of "what runs where":

- `prod-eu` installs `[core, country-de, country-fr]`.
- `prod-us` installs `[core, country-us]`.
- An app absent from the matrix is simply not installed on that instance.

**Cross-country arrangement** (a DE widget on the core Study page, only in `prod-eu`) is a
cross-app-owned placement in the EU overlay: the widget *definition* is owned by `country-de`, the
*placement* is workspace-owned arrangement — the exact case Twenty's integration tests already cover.

---

## E. Secrets

- **At rest in Git:** SOPS-encrypted (`age` or KMS) `secrets.sops.yaml` per overlay. Never plaintext.
- **In CI:** decrypted with a CI-held key, injected as `applicationVariable{ isSecret: true }` and
  `connectionProvider` oauth configs during `apply`.
- **In `.ts`:** only `secretRef('KEY')` placeholders, so the *shape* is validated in review without
  the value being present.
- **Rotation:** re-encrypt the file; `apply` updates the secret application variables. Rotation is a
  reviewed PR like any other change.

---

## F. CI/CD (GitOps)

### `plan.yml` (on every PR)
```yaml
on: pull_request
jobs:
  plan:
    strategy: { matrix: { instance: [dev, staging, prod-eu, prod-us] } }
    steps:
      - uses: actions/checkout@v4
      - run: yarn install --frozen-lockfile
      - run: yarn twenty config validate                # facet-check, dangling refs, prod pins
      - run: yarn twenty config plan --instance ${{ matrix.instance }} --format=markdown
        env: { TWENTY_TOKEN_${{...}}: ${{ secrets.* }} }
      - uses: actions/github-script@v7                   # post the diff as a PR comment
```
Each affected instance gets a diff comment showing exactly which facets change, confirming **no
definition-facet or foreign-owned metadata is touched**, and flagging any `managed-drift`.

### `apply-dev.yml` (on merge to main) → auto-apply `dev`.
### `promote.yml` (manual dispatch / gated) → protected-environment `apply` to `staging`/`prod` with
required reviewers; writes the audit record.
### `drift.yml` (nightly cron) → `twenty config plan --instance all`; alert if any `managed-drift`.

---

## G. CODEOWNERS (ownership boundaries)

```
# .github/CODEOWNERS
/apps/core/                 @bayer/platform-core
/apps/country-de/           @bayer/team-germany
/apps/country-fr/           @bayer/team-france
/apps/country-us/           @bayer/team-us
/workspace/base/            @bayer/platform-core
/workspace/overlays/prod-*  @bayer/platform-core @bayer/qa-validation   # extra approver for prod
/environments.ts            @bayer/platform-core
```

Country teams ship their app independently; only platform (+ QA/validation for prod) can change base
or prod overlays. A country release cannot touch core or another country, and — because of the
mutation guard (`03` §C) — cannot mutate core's definitions even at apply time.

---

## H. Branching model

- **Trunk-based** on `main`; short-lived PR branches.
- `dev` continuously reflects `main`.
- Promotion PRs pin versions forward; no long-lived environment branches (avoids drift between
  branches). The environment differences live in **overlays**, not in branches.
- Tags mark app releases (`bayer-core@1.4.0`) for immutable promotion references.

---

## I. What the platform team gets

- One repo to review the whole estate; atomic cross-cutting PRs.
- `plan` on every PR; nothing reaches prod unseen.
- Reproducible, pinned prod; DR = re-apply a commit.
- Clear team boundaries; independent country cadence.
- A complete, automatic audit trail (Git + CI logs + server audit). See `08-testing-and-verification.md`.
