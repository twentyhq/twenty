# Contributing

For maintainers of the plugin itself. Agents *using* the plugin → see [`AGENTS.md`](./AGENTS.md).

## Gate

```bash
npx nx run twenty-codex-plugin:validate
npx nx run twenty-codex-plugin:test
```

Both must pass before merge. No new runtime deps in `scripts/` — validators use Node built-ins only.

## Adding a skill

1. Create `skills/<name>/SKILL.md` (frontmatter: `name`, `description` only) and `skills/<name>/agents/openai.yaml` (`display_name`, `short_description` ≤ 64, `default_prompt` mentioning `$<name>`).
2. Add a `## When To Use` section with 4–6 user-language triggers and "do not use this skill for X" callouts referencing siblings.
3. Add the name to `EXPECTED_CANONICAL_SKILLS` in `scripts/validators/skills.js`.

## Adding a reference

1. Place under `references/<area>/<name>.md`. Link from the SKILL.md that needs it.
2. Add the path to `REQUIRED_REFERENCES` in `scripts/validators/references.js`.
3. If the file participates in a cross-doc contract, update `scripts/validators/cross-doc-contracts.js` in the same commit.

## Bumping the version

Move all three together: `package.json`, `.codex-plugin/plugin.json`, `templates/marketplace.example.json`. Then move `[Unreleased]` in `CHANGELOG.md` under a new `[X.Y.Z] - YYYY-MM-DD` heading.

SemVer: **patch** for copy/validation fixes, **minor** for new references/rules/skill sections, **major** for renaming a canonical skill or breaking the frontmatter/agents.yaml shape.

## Editing validators

New assertion = new function in the right `scripts/validators/*.js` module + a call from `scripts/validate.js` + at least one passing and one failing fixture in `scripts/__tests__/validate.spec.js`.

## PRs

One concern per PR. Title prefix: `feat|fix|docs|chore(codex-plugin):`. Mention the [`CHECKLIST.md`](./CHECKLIST.md) rows touched.
