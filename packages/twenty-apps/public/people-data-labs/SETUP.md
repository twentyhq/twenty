# People Data Labs: self-hosting setup

This guide is for Twenty **server admins**. It covers the People Data Labs API
key the app needs and the settings workspace admins can tune.

If you're on **Twenty Cloud**, the API key may already be configured: check
with your workspace before setting it.

## Server variables

Set this on the application registration after installing (**Settings →
Applications → People Data Labs → Application registration**, admin only):

| Server variable | Required | Purpose |
|---|---|---|
| `PDL_API_KEY` | Yes | People Data Labs API key used for person and company enrichment. |

If the key is missing, or People Data Labs rejects it or the account is out of
credits, enrichment fails with *"People Data Labs enrichment is unavailable.
Contact your workspace admin."*

## App settings

Workspace admins tune matching in **Settings → Applications → People Data Labs
→ Variables**. Each setting accepts an integer from 1 to 10, and an empty
setting uses its default.

| Setting | Variable | Default | Used for |
|---|---|---|---|
| Minimum likelihood for people | `PDL_PERSON_MIN_LIKELIHOOD` | 2 | People matched by PDL ID, LinkedIn or email |
| Minimum likelihood for companies | `PDL_COMPANY_MIN_LIKELIHOOD` | 2 | Companies matched by PDL ID, domain or LinkedIn |
| Minimum likelihood for name-based people matches | `PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD` | 6 | People matched by name and company |
| Minimum likelihood for name-based company matches | `PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD` | 6 | Companies matched by name only |

Name-based matches use the higher of the name-based setting and the people or
company setting.

## Workflow inputs

The enrichment workflow steps expose two optional inputs that take precedence
over the settings:

- **Minimum likelihood (1-10)** applies to every match, including name-based
  ones.
- **Minimum likelihood for name-based matches (1-10)** applies to name-based
  matches only, and takes precedence over **Minimum likelihood** for them.
