# People Data Labs: self-hosting setup

This guide is for Twenty **server admins**. It covers the People Data Labs API
key the app needs.

## Server variables

Set this on the application registration after installing (**Settings →
Applications → People Data Labs → Application registration**, admin only):

| Server variable | Required | Purpose |
|---|---|---|
| `PDL_API_KEY` | Yes | People Data Labs API key used for person and company enrichment. |

If the key is missing, or People Data Labs rejects it or the account is out of
credits, enrichment fails with *"People Data Labs enrichment is unavailable.
Contact your workspace admin."*
