---
name: twenty-release-notes
description: Encodes Twenty's release-note and commit convention — conventional-commit prefixes (feat/fix/chore/refactor/docs/perf) with a package-area scope (server, front, auth, ai, sdk...), and assembles release notes grouped by twenty-server vs twenty-front. Use when writing a commit/PR title for Twenty, drafting release notes or a developer changelog from merged commits, or grouping changes by package.
---

# Twenty Release-Note Convention

Twenty uses Conventional Commits with a package-area scope, and developer release notes are grouped by package (twenty-server vs twenty-front, plus shared/other). This skill covers two tasks: writing a conforming commit/PR title, and assembling grouped release notes from commit history.

For the user-facing marketing changelog (the `.mdx` files on the website), use the `changelog-process` rule instead — that is a different, image-driven artifact.

## Commit / PR title format

```
type(scope): short imperative summary (#PR_NUMBER)
```

- `type` — required, lowercase. See types below.
- `(scope)` — optional but strongly preferred; the package area (see scopes below).
- summary — imperative mood, lowercase start, no trailing period.
- `(#PR_NUMBER)` — appended automatically on squash-merge; include it in release notes, not when authoring.

Examples (real):

```
feat(server): opt-in FRONT_AUTO_BASE_URL for hostname-relative API URL
fix(front): ignore IME composition Enter in input hotkeys
fix(ai): route xAI search through Responses API as native tools
chore(deps): bump typescript from 5.9.2 to 5.9.3
refactor(twenty-orm): migrate 23 grandfathered entities to WorkspaceScopedRepository
```

## Types

Ordered by how common they are in this repo:

| Type | Use for |
|------|---------|
| `fix` | Bug fixes |
| `feat` | New user-facing or API capability |
| `chore` | Deps bumps, catalog syncs, version bumps, housekeeping |
| `refactor` | Internal restructuring, no behavior change |
| `docs` | Documentation only |
| `perf` | Performance improvements |
| `ci` | CI/workflow/pipeline changes |
| `revert` | Reverting a prior commit |
| `test` | Test-only changes |

Use `chore(deps)` / `chore(deps-dev)` for dependency bumps and `chore(security)` for CVE bumps.

## Scopes

Scope is the package area, not the literal package folder. Prefer the short form (`server`, `front`) over the package name (`twenty-server`, `twenty-front`) — both appear, short form is more common. Use a feature/module scope when it is more specific and meaningful (e.g. `auth`, `messaging`, `dashboards`).

Common scopes in use: `server`, `front`, `auth`, `ai`, `ai-billing`, `sdk`, `messaging`, `upgrade`, `twenty-orm`, `filters`, `page-layout`, `settings`, `dashboards`, `sso`, `role`, `rest-api`, `localization`, `contact-creation`, `secret-encryption`, `website`, `docker`, `ci`, `deps`, `deps-dev`, `security`, `shared`, `docs`, `self-host`.

When unsure, omit the scope (`fix: ...`) rather than invent one — bare-type commits are accepted.

## Release-note grouping

Developer release notes group entries by package. Map each commit's scope to a group:

| Group | Scopes |
|-------|--------|
| **twenty-server** | `server`, `twenty-server`, `auth`, `sso`, `ai`, `ai-billing`, `ai-chat`, `messaging`, `upgrade`, `secret-encryption`, `twenty-orm`, `rest-api`, `role`, `data-model`, `contact-creation`, `email` |
| **twenty-front** | `front`, `twenty-front`, `settings`, `dashboards`, `filters`, `page-layout`, `navigation`, `navigation-drawer`, `address`, `localization`, `front-component-renderer`, `command-menu` |
| **Shared / Other** | `shared`, `sdk`, `website`, `docs`, `self-host`, `docker`, `ci`, `deps`, `deps-dev`, `security`, `preview-env`, and anything unmapped |

Within each group, sort by type in this order: `feat`, then `fix`, then `refactor`/`perf`, then `chore`/`docs`/`ci`.

## Generating grouped release notes

1. Collect commits in the range (between two tags, or since the last release):

```bash
git log v2.8.0..v2.9.0 --pretty=format:'%s' --no-merges
# or since a date:
git log --since="2 weeks ago" --pretty=format:'%s' --no-merges
```

2. Parse each subject as `type(scope): summary (#PR)`. Keep the `(#PR)` reference.
3. Assign to a group via the scope mapping above. Commits without a recognizable scope go to **Shared / Other** unless their summary clearly belongs to a package.
4. Drop noise from developer release notes: `chore(deps)` bumps, `i18n - translations` commits, and pure `ci`/internal `chore` entries — or fold them into a single "Maintenance" line.

## Output template

```markdown
## {VERSION}

### twenty-server
- feat(auth): resume workspace selection on /welcome with valid tokenPair cookie (#20575)
- fix(server): map PermissionsException to proper HTTP status on REST API (#20739)

### twenty-front
- feat(settings): move email handles and emailing domains to dedicated Email page (#21008)
- fix(front): ignore IME composition Enter in input hotkeys (#20958)

### Shared / Other
- chore(deps): dependency bumps and catalog syncs
- docs(sdk): document DatabaseEventPayload and simplify its type (#20754)
```

## Handling non-conforming commits

A meaningful share of history does not follow the convention (e.g. `Fix latency spike on application lookup (#21042)`, `[Website] i18n module ...`, `Ses outbound followup`). When assembling notes:

- Do not rewrite history. Reclassify in the notes only.
- Infer type from the leading verb (`Fix` → fix, `Add` → feat) and infer the group from the summary's subject area.
- If a commit cannot be confidently placed, list it under **Shared / Other**.
