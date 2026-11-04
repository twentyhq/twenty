# People Data Labs

**Turn a name into a full profile — enrich any Person or Company in one click.**

## ✨ What you get

- **+30 rich data fields** per Person and Company — seniority, skills, firmographics, funding, socials & more
- **Run it anywhere** — from the command menu, as a workflow step, or straight from AI chat
- **Smart matching** — finds the right profile from a LinkedIn, email, or domain, and only writes confident matches. Set the minimum likelihood in the app settings to adapt matching to your needs

## 💳 Billing

Pay only for matches, in Twenty credits — **not found and skipped records are free.**

- **Person match:** $0.15
- **Company match:** $0.075

## Match requirements

In the app settings, use **Required fields for people matches** and **Required fields for company matches** to select the output fields a match must contain. Both selections are empty by default. Every selected field must be present, following PDL's [`required` parameter](https://docs.peopledatalabs.com/docs/input-parameters-person-enrichment-api#required).

All four enrichment workflow actions also have a **Required fields for a match** multiselect. An untouched selection uses the app setting. A workflow selection overrides it, and clearing a selection requires no fields for that action.

The selectors offer output fields supported by the app. Fields sent as matching inputs, such as company name and website, are excluded because PDL does not support requiring them in the same request.
