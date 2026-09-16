# Contributing

This package is the canonical source for Twenty app skills and the Codex plugin. Agents using the plugin should read [`AGENTS.md`](./AGENTS.md).

## Source and Distribution

Edit `skills/<name>/SKILL.md` and shared `references/` directly. Keep this content harness-neutral. Codex-specific behavior belongs in `.codex-plugin/`, `.mcp.json`, `agents/openai.yaml`, and `scripts/setup-mcp.sh`.

`build` creates ignored `dist/` with self-contained skill directories, the shared references needed by `AGENTS.md`, and Codex metadata. Both the `skills` CLI and Codex install that distribution. Never edit or commit generated files to `main`.

The main-only publishing workflow validates and builds this package, then publishes the contents of `dist/` at the root of the `agent-skills` branch. That branch is created on the first successful publish after merge. Until then, install from the local build as described in [`README.md`](./README.md#local-development). Codex marketplace entries should select this same published branch; the local template selects `./packages/twenty-agent-skills/dist`.

## Checks

Run from the repository root:

```bash
npx nx run twenty-agent-skills:validate
npx nx run twenty-agent-skills:build
npx nx run twenty-agent-skills:test
```

All must pass before merge. Build validation checks that references remain within each installed skill. Scripts use Node built-ins only; no new runtime dependencies.

For an actual installation check, install the built distribution into an isolated directory with the `skills` CLI, then verify its installed copies:

```bash
npx nx run twenty-agent-skills:verify:install -- "<install-directory>" create-app
```

Omit skill names to verify all five. CI exercises both single-skill and all-skill installs. Changes affecting scaffold or sync guidance also need the manual procedure in [`SMOKE-TEST.md`](./SMOKE-TEST.md).

## Adding a Skill

1. Create `skills/<name>/SKILL.md` (frontmatter: `name`, `description` only) and `skills/<name>/agents/openai.yaml` (`display_name`, `short_description` ≤ 64, `default_prompt` mentioning `$<name>`).
2. Add a `## When To Use` section with 4–6 user-language triggers and “do not use this skill for X” callouts referencing siblings.
3. Add the name to `CANONICAL_SKILL_NAMES` in `scripts/validators/lib.js`.

## Adding a Reference

1. Place it under `references/<area>/<name>.md` and link it from the skills that need it. The build follows these links to bundle each skill's references.
2. Add the path to `REQUIRED_REFERENCES` in `scripts/validators/references.js`.
3. If the file participates in a cross-doc contract, update `scripts/validators/cross-doc-contracts.js` in the same commit.

## Bumping the Version

Update `package.json` and `.codex-plugin/plugin.json` together. Then move unreleased entries in `CHANGELOG.md` under a new `[X.Y.Z] - YYYY-MM-DD` heading.

SemVer: **patch** for copy/validation fixes, **minor** for new references/rules/skill sections, **major** for renaming a canonical skill or breaking the frontmatter/agents.yaml shape.

The public Codex plugin identifier remains `twenty`; it does not follow the workspace package name.

## Editing Validators

Add source assertions in the appropriate `scripts/validators/*.js` module and call them from `scripts/validate-source.js`. Add passing and failing fixtures in `scripts/__tests__/source-validation.spec.js`. Distribution checks live in `scripts/validate-distribution.js`, with fixtures in `scripts/__tests__/distribution-validation.spec.js`.

## PRs

One concern per PR. Title prefix: `feat|fix|docs|chore(agent-skills):`. Mention the relevant checks and any [`CHECKLIST.md`](./CHECKLIST.md) rows touched.
