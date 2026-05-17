---
name: twenty-record-presentation
description: "Retrieve and present Twenty CRM records as readable summaries or tables, using the connected Twenty MCP server to discover fields, fetch relevant data, format dates and values, build record links, and avoid raw API output."
---

# Twenty Record Presentation

## Overview

Retrieve the Twenty records needed to answer the user's question, then present them as a useful answer, not as raw API output. Always translate technical fields, timestamps, IDs, and nested structures into readable summaries that help the user scan, compare, and act.

## Retrieval Workflow

Use the selected connected Twenty MCP server when it is available

- `get_tool_catalog` → `learn_tools` → `execute_tool`
- Discover the relevant object, fields, filters, and sort options instead of guessing exact API names.
- Retrieve only the fields needed for the answer, plus the fields needed for ordering or disambiguation.
- For "latest", "most recent", or "recent" requests, include the relevant timestamp field used for sorting.
- If the user asks for a broad list, apply a practical limit and state how many records are shown.
- If required context is missing and cannot be discovered from the tools, ask one concise clarifying question.
- If no Twenty MCP tools are available, say that no callable Twenty MCP server is available in the current thread and ask the user to connect or expose the intended workspace.

## Response Shape

Start with the answer or count, then show the records in the clearest compact shape:

- For one record, use a labeled block.
- For 2 to 10 comparable records, use a Markdown table.
- For larger sets, show the most relevant rows first, mention the total, and offer the next useful filter or page only when needed.
- For nested records, summarize the important nested values instead of dumping JSON.
- When comparing records across workspaces, prefer one combined table with a Workspace column if it improves scanning. Use separate sections only when each workspace needs different columns.

Use English labels and prose. Keep user-provided names, record values, emails, URLs, and proper nouns unchanged.

## Record Links

Link records back to their original Twenty context whenever the workspace origin and record identity are known.

- Build record links with the Twenty show-page path: `/object/:objectNameSingular/:objectRecordId`.
- For absolute links, combine the workspace origin with that path, for example `https://example.twenty.com/object/person/record-id`.
- Use `recordReferences` from MCP responses when available to get `objectNameSingular`, `recordId`, and `displayName`.
- If `recordReferences` is missing, use the record's `id` and the object name from the tool that returned it.
- Prefer linking the record display name in tables and summaries instead of adding a raw ID column.
- When showing records from multiple workspaces, generate links with each record's own workspace origin.
- If the workspace origin is unknown, do not invent a hostname. Add a compact Record column with the object name and record ID, or say that direct links need the workspace URL.

## Dates and Times

Never expose ISO/RFC3339 timestamps as the main date display.

- Parse common technical formats such as `2026-05-05T09:43:18.123Z`, `2026-05-05T09:43:18+02:00`, Unix seconds, and Unix milliseconds.
- Convert instants with `Z` or an explicit offset to the user's timezone when known. If timezone is unknown, keep the source timezone or ask only when it changes the meaning.
- Preserve date-only values as dates. Do not shift date-only values across timezones.
- Display absolute dates. Use relative words such as "today", "yesterday", or "last week" only as a supplement when helpful.
- Include the year unless it is truly redundant in a small same-year table.
- Show seconds and milliseconds only when they matter for debugging, audit logs, or ordering events with near-identical times.

Examples, with user timezone Europe/Paris, UTC+2 in May:

- Timestamp: `2026-05-05T09:43:18.123Z` → May 5, 2026, 11:43 AM
- Date-only value: `2026-05-05` → May 5, 2026

If the exact raw timestamp is relevant, put it after the readable value:

- Created: May 5, 2026, 11:43 AM (raw: `2026-05-05T09:43:18.123Z`)

## Field Labels

Convert raw field names into user-facing labels:

- `createdAt` → Created
- `updatedAt` → Last updated
- `deletedAt` → Deleted
- `createdBy` → Created by
- `workspaceMemberId` → Workspace member
- `opportunityStage` → Opportunity stage

Prefer the label users see in Twenty when it is available from metadata. Otherwise, split camelCase, snake_case, and kebab-case into normal words.

## Value Formatting

Format values by meaning:

- **Empty or null**: Not set, or omit if the field is irrelevant.
- **Booleans**: Yes / No.
- **Money**: include currency and grouping, for example EUR 12,450 or USD 12,450 based on the record currency.
- **Percentages**: use `%`, round only enough to stay meaningful.
- **URLs and emails**: make them clickable Markdown links when useful.
- **IDs and UUIDs**: hide by default unless the user asks for identifiers, deduplication, debugging, or exact references.
- **Arrays**: show the count and the most important names, not the full serialized array.

## Record Ordering

When the user asks for "latest", "recent", or "last records":

- State which date field was used when it is not obvious, for example *sorted by Last updated*.
- Prefer `updatedAt` for "recent activity" and `createdAt` for "newest records" unless the user's wording or object semantics points to another date.
- Display the chosen date column in readable form.
- If multiple records share the same date, keep a deterministic secondary order such as name or ID.

## Table Alignment

Make tables easy to scan before making them visually decorative.

- Use Markdown alignment markers intentionally: text columns left-aligned (`:---`), numeric money/count columns right-aligned (`---:`), and short status columns centered only when that actually improves scanning (`:---:`).
- Keep record names on a stable left edge. If rows have favicons, use a dedicated narrow Icon column followed by a linked record-name column.
- If the table is compact and the image is known to be consistently small, it is acceptable to put `![alt](url) [Name](record-url)` in one cell. Do not also add emoji or extra symbols before the name.
- Keep fixed-format fields such as Created, Updated, Amount, and Source to the right of variable-width fields such as Name, Company, Person, and Domain.
- Use a consistent date format within a table so rows line up visually, for example *May 5, 2026, 11:43 AM* or *May 5, 11:43*.
- Prefer natural links over extra link columns: link the record name to Twenty, and link the domain or email only when that external destination is useful.
- Avoid raw ID columns in normal user-facing tables. IDs are long, visually dominant, and destroy alignment unless the user asks for them.

## Markdown Patterns

### Compact table

Use a compact table for comparable records:

```markdown
I found 5 recent opportunities, sorted by last updated date.

| Name | Stage | Amount | Last updated |
| :--- | :--- | ---: | :--- |
| [Acme renewal](https://example.twenty.com/object/opportunity/record-id-1) | Negotiation | EUR 12,450 | May 5, 2026, 11:43 AM |
| [Globex expansion](https://example.twenty.com/object/opportunity/record-id-2) | Discovery | EUR 8,000 | May 4, 2026, 4:10 PM |
```

### Labeled block

Use a labeled block for one important record:

```markdown
**[Acme renewal](https://example.twenty.com/object/opportunity/record-id-1)**

- Stage: Negotiation
- Amount: EUR 12,450
- Next action: Not set
- Last updated: May 5, 2026, 11:43 AM
```

## Raw Data Exceptions

Show raw JSON, raw timestamps, internal IDs, or full nested objects only when the user asks for debugging, export, exact API payloads, schema inspection, or reproducible commands. Even then, put a readable summary before the raw block.

Example:

> Acme renewal — Negotiation stage, EUR 12,450, last updated May 5, 2026, 11:43 AM. Full payload below:
>
> ```json
> {
>   "id": "record-id-1",
>   "name": "Acme renewal",
>   "stage": "NEGOTIATION",
>   "amountMicros": "12450000000",
>   "currencyCode": "EUR",
>   "updatedAt": "2026-05-05T09:43:18.123Z"
> }
> ```
