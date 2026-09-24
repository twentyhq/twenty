# People Data Labs

**Turn a name into a full profile — enrich any Person or Company in one click.**

## ✨ What you get

- **+30 rich data fields** per Person and Company — seniority, skills, firmographics, funding, socials & more
- **Run it anywhere** — from the command menu, as a workflow step, or straight from AI chat
- **Smart matching** — finds the right profile from a LinkedIn, email, or domain, and only writes confident matches

## Enrichment defaults

Set the minimum match likelihood in the app's settings. Each setting accepts an integer from 1 to 10:

- **Minimum likelihood for people** (`PDL_PERSON_MIN_LIKELIHOOD`): defaults to 2.
- **Minimum likelihood for companies** (`PDL_COMPANY_MIN_LIKELIHOOD`): defaults to 2.
- **Minimum likelihood for name-based matches** (`PDL_WEAK_IDENTIFIER_MIN_LIKELIHOOD`): defaults to 6. Applies when matching a person by name and company, or a company by name only. Uses the higher of this value and the people or company minimum.

Command menu items use these defaults. Single-record and bulk workflow nodes use them when their minimum likelihood input is empty; an explicit workflow value takes precedence.

When a setting is empty, enrichment uses its default from the application variable config.

## 💳 Billing

Pay only for matches, in Twenty credits — **not found and skipped records are free.**

- **Person match:** $0.336
- **Company match:** $0.12
