# GitHub

Lets Twenty's agents and workflows read and act on GitHub repositories, issues and pull requests.

## What it does

The app declares GitHub's remote MCP server (`https://api.githubcopilot.com/mcp/`). Once installed, each member connects their own GitHub account from the server's page under Settings > AI. The workspace's AI then gets GitHub's tools (`mcp__github__*`) and calls them as that member, so it only reaches what their GitHub account can reach.

The sign-in asks for the `repo`, `read:org`, `read:user`, `user:email`, `project` and `notifications` scopes. The app reads no workspace data.

## Setup

GitHub does not let clients register themselves, so the server needs a GitHub OAuth app:

1. Create an OAuth app under GitHub > Settings > Developer settings > OAuth Apps, with the callback URL `https://<your-twenty-host>/auth/apps/callback`.
2. Set its client ID and a client secret as the `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` server variables in Twenty.

Until both are set, the connect button on the server's page stays disabled.

Organizations with OAuth app access restrictions must approve the app before members can reach their repositories through it.
