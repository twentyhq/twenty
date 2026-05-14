---
name: publish-app
description: Use when the user wants to prepare or verify a Twenty app for npm or marketplace publication, including README/About copy, package metadata, defineApplication marketplace metadata, logos, screenshots, and public assets.
---

# Publishing Checklist

Use `../../references/publish-app/prepare-for-app-store.md` for detailed README, marketplace copy, logo, screenshot, and public asset guidance.

Keep the skill workflow concise:

- Inspect `package.json`, `README.md`, `src/application-config.ts`, and `public/`.
- For npm marketplace publication, ensure `package.json` has a valid bumped `version` and the `twenty-app` keyword.
- In `defineApplication()`, verify marketplace-facing fields such as `displayName`, `description`, `author`, `category`, `logoUrl`, `screenshots`, `aboutDescription`, `websiteUrl`, `termsUrl`, `emailSupport`, and `issueReportUrl`.
- Keep `logoUrl` and `screenshots` pointed at files in `public/`. Public assets must not contain secrets, private data, customer records, real tokens, or unreleased confidential material.
- Remember that if `aboutDescription` is omitted, the marketplace uses the package `README.md` from npm for the About content.
- Validate with `yarn twenty build`; publish with `yarn twenty publish` or `yarn twenty publish --tag <tag>`.

# Boundaries

Use `$manage-app` for remotes, deploys to a specific server, logs, troubleshooting, and CI/CD operations.

Use `$develop-app` when the app entities themselves need to change before the listing can be accurate.

# Docs

If the needed publishing detail is unclear, search the official Twenty docs through the bundled `twenty-docs` MCP server before guessing.
