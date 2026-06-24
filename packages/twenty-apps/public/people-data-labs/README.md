# People Data Labs enrichment

Enriches **Person** and **Company** records with data from [People Data Labs](https://www.peopledatalabs.com/) (PDL): job and role details, location, company firmographics, funding, social profiles, and more.

## What it does

For each record you enrich, the app matches it against People Data Labs and writes the result back to Twenty. It fills a handful of Twenty standard fields, adds a rich set of dedicated PDL fields, and records the outcome of the last attempt.

### Standard fields it can fill

- **Person:** name, emails, phone numbers, job title, and LinkedIn link. If the person has no company yet, the app also looks up (or creates) their current company and links it.
- **Company:** name, domain name, LinkedIn link, and address.

Standard fields are only used to complete your existing data. By default they are filled **only when empty**, so your own values are never overwritten unless you explicitly choose to overwrite (see overwrite modes below). The existing person-to-company link is never overwritten.

### PDL fields it adds

The app adds around 30 dedicated PDL data fields on Person and 28 on Company (plus the bookkeeping fields listed below). These are always written on a match. Highlights:

- **Person:** seniority, job role, job title class and sub-role, industry, inferred salary, headline and summaries, years of experience, LinkedIn connections, birth date/year, skills, interests, education, work experience, certifications, languages, social profiles (GitHub, Twitter/X, Facebook), and a detailed PDL location.
- **Company:** industry, company type, size range and employee count, founded year, funding stages and total funding (in USD), headline and summary, legal name, ticker and exchange, tags, alternative names and domains, NAICS/SIC classifications, employee counts by country, and social profiles.

Each object also gets bookkeeping fields: a PDL id, the raw PDL payload, the time of the last enrichment, the match likelihood (Person), and an enrichment status.

Two pre-built table views named **Enriched (PDL)** are added — one on People and one on Companies — to surface the enrichment fields.

## How matching works

The app matches records using the identifiers already on them, in priority order:

- **Person:** PDL id, LinkedIn URL, primary email, or full name paired with a company name. LinkedIn URL and email are treated as strong identifiers; a name on its own is not used.
- **Company:** PDL id, website domain, LinkedIn URL, or company name. Website and LinkedIn are treated as strong identifiers.

When a record has only weak signals (for example a person's name plus company, or a company name alone), the app applies a stricter confidence threshold to reduce false positives.

If a record has no usable identifier, it is **skipped** (and never billed).

## Overwrite modes

When you trigger enrichment you can choose how matched data is written back:

- **Yes and don't overwrite** (default): writes PDL fields and fills standard fields only where they are currently empty.
- **Yes and overwrite**: writes PDL fields and replaces existing standard field values.
- **No**: returns the enriched data without modifying the record.

In all cases the dedicated PDL fields are written on a match.

## Enrichment status

The enrichment status field written to each record records the outcome of the last attempt, and can hold one of three values:

- **Matched** — a confident match was found and data was written.
- **No Match** — PDL returned no confident match.
- **Error** — the enrichment attempt failed.

Records that are skipped because they have no usable identifier are reported as skipped in the action's returned result and bulk summary, but no status is written back to the record (nothing is changed or billed for them).

## How to trigger it

- **Manual action:** run enrichment on a single record or on a selection of records from a People or Companies view.
- **Workflow action:** add **Enrich Person**, **Enrich Company**, **Enrich People**, or **Enrich Companies** as a step in a workflow.
- **AI tool:** the single-record **Enrich Person** and **Enrich Company** actions are also available to AI agents.

Bulk enrichment processes records in batches and reports how many were matched, not found, skipped, or errored.

## Billing

Only successful matches are billed, in Twenty credits — records that are not found, skipped, or that error are free.

- **Person match:** $0.336
- **Company match:** $0.12

A match is billed based on PDL's response. In the rare case where a record matches but the write back to Twenty fails afterward, the match is still counted.

## Setup

Set the **`PDL_API_KEY`** server variable to your People Data Labs API key. This is required for the app to function.
