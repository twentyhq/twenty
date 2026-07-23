# Architecture — twenty-partners

Vertical-slice modules, one folder per domain. Adapted from `twentyhq/twenty-eng`
(the largest Twenty SDK app), which migrated flat → modular as it grew. Repo-wide
conventions (kebab-case files, named exports, no `any`, `types` over `interface`,
short `//` comments) live in the root `CLAUDE.md` and still apply — this file only
adds the partners-specific structure.

> **Status:** migration complete — every domain lives under `src/modules/`. The only
> top-level `src/` entries left are `constants/universal-identifiers.ts`, `scripts/`,
> `roles/`, `skills/`, `workflows/`, `__tests__/`, and the two root config files. Add new
> code to a domain module, never a flat top-level `src/<primitive>/` folder.

## Layout

```
src/
  application-config.ts          # app + application variables — unchanged
  default-role.ts                # unchanged
  constants/universal-identifiers.ts   # ⚠️ MUST NOT MOVE (see Invariants)
  scripts/                       # ⚠️ MUST NOT MOVE — seed/purge/rls/slugify
  roles/                         # app-wide RLS — stays at root (spans every object)
  skills/                        # bundled Claude skills — unchanged
  workflows/                     # bundled workflows — unchanged
  __tests__/helpers/             # shared test setup (client, fixtures, cleanup)
  modules/
    shared/                      # cross-cutting: secret-guard (http/), find-or-create, paginate,
                                 #   utils, front-components, cross-domain nav folders
    <domain>/                    # partner · application · opportunity · …  (large domains add a <feature>/ tier)
      <name>.logic-function.ts   # thin SDK entrypoints — sit at the domain/feature root, NOT in a subfolder
      objects/ fields/ view-fields/ views/ navigation-menu-items/ page-layouts/   # declarations
      constants/                 # value lists + declaration UUID maps (NOT types)
      services/                  # business logic (testable)
      graphql/{queries,mutations}/   # the only place raw queries/mutations live
      connector/                 # OUTBOUND third-party API per folder (<name>.connector.ts · config · types)
      mappers/  utils/  types/  front-components/
```

A domain is a self-contained slice: its declarations (`objects`, `fields`, `views`, …)
**and** its logic (`logic-functions` → `services` → `graphql`/`connector`) live together.
Adding a feature means adding a folder, not scattering files across ten flat piles.

**Feature tier for large domains:** when a domain holds several distinct features, insert a
`<feature>/` level — `modules/<domain>/<feature>/<primitive>/` (the twenty-eng standard,
e.g. `modules/code-build/build-task/services/`). It keeps `graphql/` and `services/` from
becoming flat piles. Partner uses `partner/{self-service,marketplace,application-intake,
directory}/…`; opportunity uses `opportunity/{intake,matching}/…`. A small single-feature
domain (application) may keep `<domain>/<primitive>/` directly.

## The dependency rule (the one that matters — never import upward)

```
logic-functions → services → { graphql, connector, mappers } → shared · utils · types
```

- **Entrypoints (`*.logic-function.ts`, at the domain/feature root)** — SDK entrypoint
  ONLY. Parse input, call one service, return. No business logic, no raw GraphQL, no
  external HTTP. >~40 lines means it's doing a service's job — extract it.
- **`services/`** — all business logic. Testable, no SDK/transport coupling. Must **not**
  import a `logic-function`.
- **`graphql/`** — the ONLY place raw queries/mutations live (named typed operations,
  not inline `client.query(...)`).
- **`connector/`** — the ONLY place **outbound** third-party APIs are called; one folder
  per API (`<name>.connector.ts` / `config.ts` / `types.ts`). **Inbound webhooks are NOT connectors** —
  a webhook the app *receives* is an ordinary `logic-functions/` entrypoint guarded by the
  shared secret-guard util. (Today the one real connector is Discord; TFT/client-brief/
  partner-application are inbound.)
- Never import **logic** sideways between domains — share via `modules/shared/`. (A relation
  field naturally referencing its target object's ID constant is a schema reference, not a
  logic dependency — that cross-module import is allowed.)

## Naming

`<name>.<primitive>.ts` — e.g. `submit-application.logic-function.ts`,
`resolve-candidacy.service.ts`, `partner.object.ts`. Files are kebab-case (no PascalCase,
even for React components: `profile-picture-upload.tsx`).

Tests co-locate with their subject and split by kind: `<name>.test.ts` = unit (mocked
client, fast, no infra); `<name>.integration-test.ts` = real workspace (needs a live
server + global setup; excluded by tsconfig). The split is a selectable vitest **project**
(`--project unit`), not a file-count mandate — one `vitest.config.ts` with two projects is
preferred. Don't rename a mocked unit test to `.integration-test.ts`. Shared test setup
lives in `src/__tests__/helpers/`.

## Invariants (moving code must not break these)

- The set of `universalIdentifier` UUIDs must stay **byte-identical** across a move —
  the SDK tracks primitives by identifier, not path, so a pure `git mv` is safe but a
  changed/dropped UUID re-registers or orphans an object.
- **Do not move** `src/constants/universal-identifiers.ts` — the env-toolkit rewrites it
  by path per bundle.
- **Do not move** `src/scripts/*` — `package.json` invokes them by path.
- **Keep importers of `src/constants/universal-identifiers.ts` pointing at the root file** —
  don't relocate its UUID exports into a module.
- **Never split a relation across domains with a dangling ID import.** Paired relation
  fields export/import each other's field-ID constant; keep both sides of a relation in one
  domain, or hoist the shared ID into `shared/`.
- One domain per commit when migrating (`git mv` only, imports fixed in the same commit).

## Where does new code go?

External API call → `connector/`. Raw query/mutation → `graphql/`. Any logic →
`services/`. New SDK trigger/function → a thin `*.logic-function.ts` at the domain/feature
root that calls a service. Shared across domains → `modules/shared/`.
