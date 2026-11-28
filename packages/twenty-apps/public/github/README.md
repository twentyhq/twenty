# GitHub

Lets Twenty's agents and workflows read and act on GitHub repositories, issues and pull requests.

## What it does

The app declares GitHub's remote MCP server (`https://api.githubcopilot.com/mcp/`). Once installed, each member connects their own GitHub account from the server's page under Settings > AI. The workspace's AI then gets GitHub's tools (`mcp__github__*`) and calls them as that member, on the repositories where the GitHub App is installed and the member has access.

The app reads no workspace data.

## Setup

Members sign in through a GitHub App that the server administrator registers once:

1. Create a GitHub App under GitHub > Settings > Developer settings > GitHub Apps. Add `https://<your-twenty-host>/auth/apps/callback` as a callback URL, keep "Expire user authorization tokens" on, and turn the webhook off.
2. Give it the repository permissions its users need, for example Metadata, Contents (read), Issues and Pull requests (read and write).
3. Generate a client secret, then set the client ID and that secret as the `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` server variables in Twenty.

Until both are set, the connect button on the server's page stays disabled.
