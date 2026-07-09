# Toolbox

A toolbox of AI commands for your CRM records. The first tool it brings is a one-click record summary: from any Person, Company or Opportunity, run "Summarize" and Ask AI answers with everything your workspace knows about that record.

## What it does

The app adds a pinned "Summarize" command to the command menu of three standard objects:

- **Summarize this Person**
- **Summarize this Company**
- **Summarize this Opportunity**

Running the command opens the Ask AI side panel and sends a summary request for the selected record on your behalf. The AI agent then gathers the record's fields, its relations (company, people, opportunities) and its recent activity (notes, tasks, emails, meetings) and replies with a structured summary: a short overview followed by key facts, relationships, recent activity, open items and suggested next steps.

The commands work from a record page as well as from a table or kanban view with a single record selected.

## How it works

- Each command opens a headless front component that resolves the selected record, looks up its display name and hands over to Ask AI with a pre-sent prompt such as `Summarize what you know about the person "Jane Cooper" (record id: ...)`.
- The app ships a `record-summary` skill that teaches the agent how to research the record and how to structure the answer. The agent loads it automatically from the workspace skill catalog.
- The app role only reads records (it needs the record name for the prompt); it never writes to your workspace.

## Requirements

- AI must be enabled in your workspace with at least one model provider configured (Settings > Admin Panel > AI).
- The summary quality depends on what your workspace knows: synced emails and calendar events, notes and tasks all enrich the answer.

## Limitations

- Summarizes one record at a time; selecting several records shows an error instead.
- Only People, Companies and Opportunities have a summarize command for now. More tools and more objects can join the toolbox later.
