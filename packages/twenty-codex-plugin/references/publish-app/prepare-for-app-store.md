# Prepare App Listing

Use this reference for the publish-facing documentation and visuals of a Twenty app. It complements `create-app`; read this when the app is ready for packaging, marketplace listing, npm publishing, private sharing, or user-facing review.

## When To Use

Use this when the user asks to:

- Write or improve a Twenty app `README.md`.
- Prepare npm package content or Twenty marketplace copy.
- Add or audit `defineApplication()` marketplace metadata.
- Create, select, capture, or validate app logo and screenshots.
- Decide what belongs in `public/` for marketplace, front components, or logic functions.
- Make the app understandable to admins, workspace members, and reviewers before publish/deploy.

## Source Rules

Twenty marketplace metadata comes from `defineApplication()`:

- `displayName`
- `description`
- `author`
- `category`
- `logoUrl`
- `screenshots`
- `aboutDescription`
- `websiteUrl`
- `termsUrl`
- `emailSupport`
- `issueReportUrl`

`logoUrl` and `screenshots` must reference files from the app `public/` folder, for example `public/logo.png` and `public/screenshot-1.png`. If `aboutDescription` is omitted, the marketplace uses the package `README.md` from npm as the About tab content.

Files in `public/` are public, synced in dev mode, included in builds, and served without authentication. Never put secrets, private data, customer records, real tokens, or unreleased confidential material in public assets.

## README Workflow

Before writing, inspect the app:

```bash
sed -n '1,220p' package.json
sed -n '1,220p' src/application-config.ts
find src -maxdepth 3 -type f | sort
find public -maxdepth 2 -type f | sort
```

Read app entities to understand the actual product surface:

- Objects and fields define the data model users will see.
- Views, navigation, and page layouts define the first-run experience.
- Logic functions explain automation and side effects.
- Front components explain UI surfaces and interactions.
- Skills and agents explain AI behavior.
- Connection providers explain third-party OAuth setup.
- Roles explain permission scope and data access.

Write the README for the person installing or evaluating the app, not for the original implementer.

## README Shape

Use this structure unless the app already has a stronger local convention:

```markdown
# App Display Name

One-sentence summary of what the app adds to Twenty.

## What It Does

- Concrete user-facing capability.
- Concrete user-facing capability.
- Concrete user-facing capability.

## What It Adds To Twenty

- Objects:
- Fields:
- Views and navigation:
- Page layouts:
- Front components:
- Logic functions:
- Skills and agents:
- Connections:

## Requirements

- Twenty server/version requirement, if any.
- Third-party account or OAuth app requirements, if any.
- Required server variables or application variables.

## Setup

1. Install or deploy the app.
2. Configure required variables.
3. Add any required connections.
4. Open the relevant Twenty view or app settings page.

## Usage

Short workflow with concrete user actions and expected result.

## Development

Commands for local setup, dev sync, tests, build, deploy, and publish.

## Permissions And Data

What the app reads, writes, updates, deletes, and sends to third-party services.

## Support

Support email, issue tracker, docs, terms, or website links.
```

Keep the README accurate and specific. Do not claim the app supports an entity, workflow, permission, integration, or marketplace capability unless it exists in code.

## Copy Guidelines

Use plain product language:

- Lead with the workspace outcome, not the implementation.
- Name the Twenty objects and views users will actually interact with.
- Explain setup variables by their exact names.
- Distinguish server admin setup from workspace member usage.
- For OAuth connections, mention the provider redirect URI: `<SERVER_URL>/apps/oauth/callback`.
- Document permissions in terms of user risk: read, create, update, soft delete, destroy, third-party send.

Avoid:

- Marketing filler.
- Claims about security, compliance, uptime, or certification that are not backed by the app.
- Screenshots or examples containing real customer data.
- API keys, OAuth secrets, tokens, or private server URLs.

## Visual Assets

Put marketplace and runtime visuals in `public/`:

```text
public/
  logo.png
  screenshot-1.png
  screenshot-2.png
  screenshot-3.png
```

Use stable, descriptive filenames. Prefer PNG for marketplace visuals. Keep source files only if the project already keeps editable artwork.

Logo guidance:

- Make it legible at small sizes.
- Use simple geometry or product-specific symbolism.
- Avoid text-heavy logos unless the brand requires it.
- Do not use the Twenty logo as the app logo unless the app is officially owned by Twenty and the user intends that.

Screenshot guidance:

- Capture real app surfaces after `yarn twenty dev --once` or watch-mode sync.
- Prefer the most useful user paths: app listing/about page, object index view, record page layout, front component surface, connection settings, or AI skill/agent behavior.
- Use seeded or synthetic data only.
- Hide browser chrome unless it helps explain setup.
- Do not fake product screenshots with generated images. Use generated visuals for logos, diagrams, empty-state art, or concept assets only.

When a visual is generated or edited, store the final bitmap in `public/` and reference it from `defineApplication()`. If the image appears in README markdown, include useful alt text.

## Application Metadata

Update `src/application-config.ts` with marketplace metadata when publishing:

```ts
export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  author: 'Your Company',
  category: 'Productivity',
  logoUrl: 'public/logo.png',
  screenshots: [
    'public/screenshot-1.png',
    'public/screenshot-2.png',
  ],
  websiteUrl: 'https://example.com',
  termsUrl: 'https://example.com/terms',
  emailSupport: 'support@example.com',
  issueReportUrl: 'https://github.com/org/app/issues',
});
```

Only set `aboutDescription` when the marketplace About tab should differ from the npm README. Otherwise keep one source of truth in `README.md`.

If the app requires a specific Twenty server version, set `engines.twenty` in `package.json`. If publishing to npm, add the `twenty-app` keyword.

## Validation

Before considering README and visuals done:

```bash
yarn twenty dev --once
yarn twenty dev:build
```

Then check:

- Every `logoUrl` and `screenshots` path exists in `public/`.
- `README.md` setup steps match actual variables, connections, and commands.
- `package.json` has `keywords: ["twenty-app"]` when the app is intended for npm marketplace publishing.
- `defineApplication()` metadata does not reference placeholder URLs, support addresses, screenshots, or terms.
- Screenshots are current, readable, and free of secrets or real personal data.
- Public assets render where they are used by front components, logic functions, README, or marketplace metadata.

If visual verification matters, run the app in a browser and capture fresh screenshots instead of relying on stale files.
