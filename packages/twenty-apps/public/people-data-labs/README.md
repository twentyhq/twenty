# People Data Labs

**Turn a name into a full profile — enrich any Person or Company in one click.**

## ✨ What you get

- **+30 rich data fields** per Person and Company — seniority, skills, firmographics, funding, socials & more
- **Run it anywhere** — from the command menu, as a workflow step, or straight from AI chat
- **Smart matching** — finds the right profile from a LinkedIn, email, or domain, and only writes confident matches

## Enrichment defaults

Configure `PDL_PERSON_MIN_LIKELIHOOD` and `PDL_COMPANY_MIN_LIKELIHOOD` in the app's server variables to set the default minimum likelihood for people and companies. Each accepts an integer from 1 to 10.

Command menu actions use these defaults. Single-record and bulk workflow nodes use them when their minimum likelihood input is empty; an explicit workflow value takes precedence.

When a variable is unset, enrichment uses the existing thresholds: 2 for strong identifiers (PDL ID, LinkedIn, email, or company domain) and 6 for name-based matches.

## 💳 Billing

Pay only for matches, in Twenty credits — **not found and skipped records are free.**

- **Person match:** $0.336
- **Company match:** $0.12
