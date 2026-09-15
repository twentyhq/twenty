---
name: publish-app
description: Use when the user wants to prepare or verify a Twenty app for npm or marketplace publication, including README/About copy, package metadata, defineApplication marketplace metadata, logos, screenshots, and public assets.
---

# When To Use

Pick this skill when the user wants to make an existing Twenty app *presentable* — listing copy, branding, public assets, and publication. Representative triggers:

- "prepare my Twenty app for the marketplace"
- "write the README for my Twenty app"
- "publish my app to npm"
- "add a logo / screenshots / marketplace metadata"
- "set up `defineApplication` marketplace fields"
- "review my app listing before going live"
- "ship a new version of my published app"

Do not use this skill to scaffold (use `create-app`), to change app entities (use `develop-app`), to deploy a private build to a specific Twenty server (use `manage-app`), or to query workspace records (use `use-twenty-mcp`).

# Publishing Checklist

For background on how Twenty apps work — the SDK packages, remotes, sync lifecycle, and rendering model — read `../../references/concepts/how-apps-work.md`.

Use `../../references/publish-app/prepare-for-app-store.md` for detailed README, marketplace copy, logo, screenshot, and public asset guidance.

Keep the skill workflow concise:

- Inspect `package.json`, `README.md`, `src/application-config.ts`, and `public/`.
- For npm marketplace publication, ensure `package.json` has a valid bumped `version` and the `twenty-app` keyword.
- In `defineApplication()`, verify marketplace-facing fields such as `displayName`, `description`, `author`, `category`, `logoUrl`, `screenshots`, `aboutDescription`, `websiteUrl`, `termsUrl`, `emailSupport`, and `issueReportUrl`.
- Keep `logoUrl` and `screenshots` pointed at files in `public/`. Public assets must not contain secrets, private data, customer records, real tokens, or unreleased confidential material.
- Remember that if `aboutDescription` is omitted, the marketplace uses the package `README.md` from npm for the About content.
- Validate with `yarn twenty dev:build`; publish with `yarn twenty app:publish` or `yarn twenty app:publish --tag <tag>`.

# Boundaries

Use `$manage-app` for remotes, deploys to a specific server, logs, troubleshooting, and CI/CD operations.

Use `$develop-app` when the app entities themselves need to change before the listing can be accurate.

# Docs

If the needed publishing detail is unclear, search the official Twenty docs through the bundled `twenty-docs` MCP server before guessing.
