# GitHub

Lets Twenty's agents and workflows read and act on GitHub repositories, issues and pull requests.

## What it does

The app declares GitHub's remote MCP server (`https://api.githubcopilot.com/mcp/`). Once installed in Twenty, each member connects their own GitHub account from the server's page under Settings > AI. The workspace's AI then gets GitHub's tools (`mcp__github__*`) and calls them as that member. Private repository access is limited to repositories available to both the member and the GitHub App installation.

The sign-in uses a GitHub App with fine-grained permissions, rather than an OAuth App with the broad `repo` scope. The only requested OAuth scope is `offline_access`, for expiring access tokens and refresh tokens. The app reads no workspace data.

## Setup

GitHub does not let clients register themselves, so the server operator needs a GitHub App:

1. Create a GitHub App under GitHub > Organization settings > Developer settings > GitHub Apps. Add `https://<SERVER_URL-host>/auth/apps/callback` for each Twenty environment as a callback URL. One GitHub App can serve multiple environments.
2. Keep user authorization token expiration enabled, leave device flow disabled, and disable webhooks. Allow installation on any account. Use these starting permissions:

   | Permission | Access |
   | --- | --- |
   | Repository: Metadata | Read |
   | Repository: Contents | Read |
   | Repository: Issues | Read and write |
   | Repository: Pull requests | Read and write |
   | Account: Email addresses | Read |

3. Generate a client secret. Set the GitHub App's **client ID** (not its numeric app ID) and client secret as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Twenty's Admin Panel > Apps > GitHub > Config. These are registration server variables, not environment variables. A private key is not needed for this user authorization flow.

Until both are set, the connect button on the server's page stays disabled.

## Connecting a member

Members authorize their own GitHub account in Twenty. Authorization without a GitHub App installation can access public resources; it does not grant private repository access. To enable private repositories, install the GitHub App on the account or organization that owns them, selecting only the repositories you want to expose. Organization owners may need to approve the installation.

Share the registered app's installation link, `https://github.com/apps/<registered-app-slug>/installations/new`. The slug comes from the GitHub App registration; it is not the Twenty application identifier.

## Permission limits

The starting permissions support reading repository contents and working with issues and pull requests. They do not grant code writes, pull request merges, repository administration, Actions, Projects, or security alert access. MCP tools that require additional permissions may be unavailable or fail. Add permissions only when those capabilities are needed and have been approved.

Access tokens expire and are renewed through Twenty's OAuth refresh flow. Members must reconnect if their authorization or refresh token expires or is revoked.
