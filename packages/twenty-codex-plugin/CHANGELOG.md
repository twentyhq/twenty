# Changelog

All notable changes to the Twenty Codex plugin are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this package adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Entries reference the canonical skills (`create-app`, `develop-app`, `manage-app`, `publish-app`, `use-twenty-mcp`) and the validation script (`scripts/validate.js`).

## [0.1.0] - Unreleased

The first version of the Twenty Codex plugin.

### Added
- `AGENTS.md` at the plugin root: durable cross-skill operating rules, skill routing table, and reference-doc map.
- `CHANGELOG.md` (this file).
- `CHECKLIST.md`: best-practices compliance matrix mapping each official Codex plugin requirement to an automated check or a manual sign-off.
- `CONTRIBUTING.md`: maintainer guide for adding skills, adding references, bumping versions, updating screenshots, and running validation.
- `project.json`: Nx targets (`validate`, `test`, `setup:mcp`, `fmt`).
- `templates/marketplace.example.json`: copy-pasteable template for the user-local `.agents/plugins/marketplace.json` entry.
- `assets/screenshots/README.md`: capture brief for the three marketplace screenshots.
- `## When To Use` section in every SKILL.md with representative trigger phrases and explicit "do not use this skill for X" boundary callouts.
- New validators under `scripts/validators/`: `assertInterfaceFields`, `assertAssets`, `assertMarketplaceTemplate`, `assertSkillTriggerPhrases`.
- `scripts/__tests__/validate.spec.js`: 29 `node:test` cases (smoke + targeted negative cases) covering every validator.
- `.github/workflows/ci-codex-plugin.yaml`: CI workflow running `validate` and `test` on PRs touching the plugin.

### Changed
- `scripts/validate.js` refactored from a single 760-line file into a thin entry point plus focused modules under `scripts/validators/` (`lib`, `metadata`, `assets`, `skills`, `references`, `cross-doc-contracts`, `setup-helper`).
- `package.json`: exposed `test` script; added `AGENTS.md`, `CHANGELOG.md`, `CHECKLIST.md`, `CONTRIBUTING.md`, `templates` to `files`.
- `.codex-plugin/plugin.json`: rewrote `interface.longDescription` into 3 scannable sentences (was a single ~400-char sentence).
- `README.md`: restructured into What/Installation/Skills/MCP/Development sections; added skills-overview table; linked `CONTRIBUTING.md`, `CHECKLIST.md`, `CHANGELOG.md`.
- `scripts/validators/lib.js` `isAllowedDocumentationHost`: added `developers.openai.com`, `keepachangelog.com`, `semver.org` to the placeholder host allowlist so external documentation references in `CHECKLIST.md`, `CONTRIBUTING.md`, and `CHANGELOG.md` pass validation.
- `references/develop-app/tests.md` and `references/manage-app/cli-and-sync.md`: documented that integration tests must run against the isolated test instance (`yarn twenty docker:start --test`, port `2021`) instead of the dev instance, since the test harness installs and uninstalls the app on its target server.
- `skills/manage-app/SKILL.md`: added direct test-run routing so "run tests" requests load the tests reference and run full suites with `TWENTY_API_URL=http://localhost:2021`.
- `scripts/validators/cross-doc-contracts.js`: added a testing-guidance contract so validation fails if the port-2021 integration-test rule drifts out of the manage skill or references.
- `references/develop-app/app-structure.md`, `skills/develop-app/SKILL.md`, `references/develop-app/logic.md`, `references/develop-app/front-components.md`: made the one-export-per-file rule explicit — every helper, type, and client file exports exactly one thing, and multiple function exports in a single file are forbidden. The rule counts exports, not declarations: a local, non-exported type may live alongside the util, but an exported or reused type splits into `src/types/<name>.ts` separate from `src/utils/<name>.util.ts`.

### Plugin Structure
- `.codex-plugin/plugin.json` manifest with `interface` metadata (display name, descriptions, category, capabilities, branding, default prompts).
- `package.json` declaring the workspace package and listing shipped files.
- `.mcp.json` declaring only the public `twenty-docs` MCP server at `https://docs.twenty.com/mcp`.
- `assets/twenty-logo.png` and `assets/twenty-logo.svg` for marketplace branding.

### Skills (`skills/`)
- `create-app` — scaffold a new Twenty app via `create-twenty-app`, with prompts for the Twenty instance URL and Docker vs existing-instance choice.
- `develop-app` — add or modify Twenty app entities (objects, fields, logic functions, roles, views, layouts, skills, agents, connection providers, front components); enforces `yarn twenty dev:add` for entity generation and one-shot `yarn twenty dev --once` sync.
- `manage-app` — remotes, sync, build, deploy, logs, function execution, uninstall, and CI/CD for existing apps; requires explicit confirmation for production-affecting operations.
- `publish-app` — README/About copy, package metadata, `defineApplication` marketplace fields, logos, screenshots, npm/marketplace publication.
- `use-twenty-mcp` — workspace MCP connection, record retrieval, and readable Markdown output with linked record names.
- Per-skill `agents/openai.yaml` with `display_name`, `short_description` (≤64 chars), and `default_prompt` that mentions `$<skill-name>`.

### References (`references/`)
- `concepts/how-apps-work.md` — foundational SDK packages, remotes, sync lifecycle, front component rendering, app file structure, key concepts (linked from every skill).
- `develop-app/app-structure.md`, `data-model.md`, `front-components.md`, `layout.md`, `standalone-pages.md`, `logic.md`, `workflows.md`, `tests.md` — entity creation, file structure, validation checklist, full-page UI patterns, runtime verification.
- `design/front-component-ui.md` — visual design rules, Twenty UI defaults, design tokens, component selection.
- `manage-app/cli-and-sync.md` — CLI command semantics, sync modes, build, deploy, logs, CI/CD; explicit ban on watch mode (`yarn twenty dev` without `--once`) for agent use.
- `operations/command-execution.md` — external command execution patterns.
- `publish-app/prepare-for-app-store.md` — npm/marketplace publication checklist.
- `use-twenty-mcp/setup.md` — workspace MCP URL normalization and OAuth setup.
- `use-twenty-mcp/result-formatting.md` — record link building, date formatting, readable Markdown contract.

### Tooling
- `scripts/setup-mcp.sh` — helper to register a user-local workspace MCP endpoint with Codex; normalizes workspace URLs (adds `https://`, `/mcp` suffix), derives sensible MCP server names, supports localhost and custom domains, integrates with `codex mcp add` and OAuth.
- `scripts/validate.js` — single-file validation script enforcing version sync, no bundled workspace MCP, no secrets/non-placeholder URLs, canonical skill names, required SKILL.md + `agents/openai.yaml` shape, required reference files, cross-doc contracts (MCP formatting, front-component guidance, CLI guidance split, foundational concepts linkage), and `setup-mcp.sh` syntax + URL-normalization correctness.
