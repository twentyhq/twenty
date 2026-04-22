# GitHub Connector

Sync pull requests, issues, contributors and project items from GitHub into Twenty,
and react to GitHub webhook events in real time.

This app showcases how to build a non-trivial third-party connector with the Twenty
SDK: custom objects with rich relationships, navigation menu items, table views,
logic functions for periodic syncs, an HTTP webhook handler, and authenticated
GraphQL/REST calls against an external provider.

## What it adds to your workspace

Six custom objects:

- `pullRequest`
- `pullRequestReview`
- `pullRequestReviewEvent`
- `issue`
- `projectItem`
- `contributor` (the GitHub contributors)

Each object ships with fields, relationships, table views, and a navigation menu
entry under a top-level "GitHub" section.

A handful of logic functions are wired up so you can:

- Manually trigger a fetch of pull requests, issues, project items or contributors
- Receive GitHub webhooks at `POST /handle-webhook` and update records on the fly

## Setup

```bash
cd packages/twenty-apps/community/github-connector
yarn install
yarn twenty remote add
yarn twenty install
```

Then configure the application variables in your Twenty workspace
(Settings → Apps → GitHub Connector). You only need one of the two auth methods:

### Option 1: Personal Access Token (recommended for trying it out)

| Variable        | Required | Notes                                                              |
| --------------- | -------- | ------------------------------------------------------------------ |
| `GITHUB_TOKEN`  | yes      | Classic or fine-grained PAT with `repo` and `read:org` scopes.     |

When `GITHUB_TOKEN` is set it always wins, regardless of any GitHub App config.

### Option 2: GitHub App (recommended for production / org-wide installs)

| Variable                     | Required | Notes                                                                 |
| ---------------------------- | -------- | --------------------------------------------------------------------- |
| `GITHUB_APP_ID`              | yes      | Numeric App ID from the GitHub App settings page.                     |
| `GITHUB_APP_PRIVATE_KEY`     | yes      | PEM private key (BEGIN/END PRIVATE KEY block). Newlines are tolerant. |
| `GITHUB_APP_INSTALLATION_ID` | yes      | The installation id for your org.                                     |

The connector exchanges the App credentials for a short-lived installation token
(cached in-memory until shortly before expiry) and uses it for all GitHub calls.

### Common variables

| Variable                  | Required | Notes                                                                                    |
| ------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `GITHUB_REPOS`            | yes      | Comma-separated `owner/repo` list, e.g. `twentyhq/twenty,octo/hello`.                    |
| `GITHUB_PROJECT_NUMBERS`  | no       | Comma-separated GitHub Project (v2) numbers to sync.                                     |
| `GITHUB_WEBHOOK_SECRET`   | no       | Shared secret to verify `X-Hub-Signature-256`. When unset, signatures are not verified.  |

## Webhooks

Point your GitHub App / repository webhook at the app's `handle-webhook`
route. Recommended event subscriptions:

- Pull requests
- Pull request reviews
- Issues
- Project (v2) items

Set the same value as `GITHUB_WEBHOOK_SECRET` on both sides to enable HMAC
verification.

## How auth resolution works

`src/modules/github/connector/auth.ts` returns a token using the following
order:

1. `GITHUB_TOKEN` (PAT) if present.
2. Cached installation token, if still valid.
3. Fresh installation token minted from the GitHub App credentials.

This makes the example easy to try in 30 seconds with a PAT, while still
demonstrating the production-grade GitHub App flow.
