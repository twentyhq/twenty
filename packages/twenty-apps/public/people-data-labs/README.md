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

In the app settings, **Required fields for people matches** and **Required fields for company matches** select the output fields a match must contain, using PDL's [`required` parameter](https://docs.peopledatalabs.com/docs/input-parameters-person-enrichment-api#required). Both are empty by default.

All four enrichment workflow actions also have a **Required fields for a match** input. An empty selection uses the app setting, and any selection replaces it for that action. Refreshing a record that already has a PDL ID skips the requirements.

Company matches don't offer name and website: PDL ignores `required` when it names a field that is also sent as a matching input.
