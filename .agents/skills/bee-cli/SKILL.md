---
name: bee-cli
description: "Access real-time context and life history from Bee, a wearable AI that captures and transcribes the owner's conversations. ALWAYS start with 'bee now' for the last 10 hours of conversations with full utterances - the highest-value context for relevant help. Use this skill when: (1) you need to know what's happening RIGHT NOW - recent conversations, current context, what was just discussed; (2) the user asks about something that just happened or someone they just talked to; (3) you need life context - who the owner is, relationships, work, preferences, places they go, photos; (4) searching past conversations/daily summaries/facts, recalling where the owner was, reviewing insights, or managing facts and todos; (5) syncing or monitoring Bee data."
---

# Bee CLI

CLI client for Bee - the wearable AI that captures conversations and learns about you.

## About Bee

Bee is a wearable AI device that continuously captures and transcribes ambient audio from the owner's daily life: conversations, meetings, phone calls, and any spoken interactions. From these transcriptions Bee automatically extracts facts about the owner - preferences, relationships, work projects, commitments, and personal details - and produces daily summaries, insights, and a location history.

### Privacy and Security

**Bee data is extremely sensitive.** Transcriptions contain intimate details of the owner's personal and professional life, including private conversations never intended to be recorded or shared.

**All Bee data is end-to-end encrypted and accessible only to the owner.** Only the authenticated owner can read their content; no third party (including Bee's servers) can read the decrypted data.

**Treat all Bee information as highly confidential.** The owner has entrusted access to their most private conversations and personal details. Never expose, forward, or store this data outside what the user explicitly asks for.

## Capability Map - Which Command for Which Question

Pick the command by what the user is asking. Reach for `bee search` instead of manually listing-and-scanning whenever the question is "did I ever / when did I / what did we say about ...".

| The user wants to know... | Use |
| --- | --- |
| What's happening right now / what was just said (last 10h) | `bee now` |
| Today's plan, calendar, email brief | `bee today` |
| Today's wearable context (summary + active todos + notes + conversations) | `bee today --context` |
| Recent activity across everything (conversations, summaries, notes, todos, insights) | `bee activity` |
| Find conversations/daily/facts about a topic | `bee search --query "..."` |
| Semantic ("what was the vibe / find similar") search of conversations | `bee search --query "..." --neural` |
| Full verbatim transcript of one conversation | `bee conversations transcript <id>` (or `get <id>`) |
| Conversations similar to a given one | `bee conversations related <id>` |
| Who the owner is / preferences / relationships / work | `bee facts list`, `bee facts search --query "..."` |
| Action items / commitments | `bee todos list`; suggestions via `bee todos suggestions` |
| What happened on a given day | `bee daily find <YYYY-MM-DD>` |
| Browse day-by-day summaries | `bee daily list` |
| Owner's intentional voice memos | `bee journals list`, `bee journals search --query "..."` |
| AI-generated patterns/insights about the owner | `bee insights list` |
| Where the owner has been / frequent places / current location | `bee locations recent`, `bee locations clusters`, `bee locations current` |
| Photos captured by the device | `bee photos list`, `bee photos get <id> --output PATH` |
| What changed since last check (incremental monitoring) | `bee changed --cursor <cursor>` |
| Export everything to local markdown (backup / offline) | `bee sync` |
| Who am I authenticated as | `bee me`, `bee status` |

**Output format:** every data command prints markdown by default. Add `--json` for programmatic parsing - prefer it whenever you will parse the output rather than show it to the user.

**Source of truth:** conversation **summaries** (from `list`, `daily`, `search` results) are AI-generated and may contain minor inaccuracies. **Utterances** (from `bee now`, `conversations get`, `conversations transcript`) are verbatim and authoritative. When accuracy matters, read the utterances.

**Pagination:** list responses return a `next_cursor` field (null when there is no more data). Pass its value back via the `--cursor` flag to fetch the next page.

## Installation

Check if installed:
```bash
bee --version
```

If not installed:
```bash
npm install -g @beeai/cli
```

Or download binaries from https://github.com/bee-computer/bee-cli/releases/latest

## Authentication

Check status:
```bash
bee status
```

If not authenticated:
```bash
bee login
```

**Prefer `bee login --no-wait` (recommended for agents).** Plain `bee login` BLOCKS, polling for up to ~5 minutes until the user approves — which stalls you waiting for the command to return. Instead:

```bash
bee login --no-wait    # prints the auth link and exits immediately (no polling)
```

It prints an authentication URL like `https://bee.computer/connect#{requestId}`, saves a resumable session, and returns. Then: **send the link to the user**, and once they say they've approved it, run `bee status` to confirm (or `bee login` again to finish). Re-running `bee login --no-wait` before approval resumes the same link.

If you DO want a blocking interactive session, plain `bee login` prints the same link and then polls automatically until approval; do not interrupt while it waits. Either way the request expires in ~5 minutes; on approval the CLI prints a success message with the user's name.

Login flags: `--no-wait` (print link and exit), `--token <token>`, `--token-stdin`, `--proxy <url|socket>` (the last three are mutually exclusive; `--no-wait` applies to the interactive flow only).

To see the authenticated profile: `bee me [--json]`. To sign out: `bee logout`.

## Real-Time Context (Use First!)

**Always start with `bee now`.** It fetches all conversations from the **last 10 hours** with their full utterances - the single most valuable context for timely, relevant help.

```bash
bee now          # markdown
bee now --json   # programmatic
```

Returns, for the past 10 hours: conversations with verbatim utterances (who said what), summaries, states, and timestamps in the owner's timezone.

Use it when the owner just finished a conversation and needs follow-up, is asking about something just discussed, or you need current context for suggestions.

### Today

```bash
bee today              # Today Brief: calendar / email-style daily brief
bee today --context    # Wearable context: daily summary + active todos + notes + recent conversations
bee today --json
```

Use plain `bee today` for the day's plan; use `--context` when you want the same aggregated wearable context an assistant would use to ground the day.

### Recent Activity

```bash
bee activity [--limit N]   # --limit max 20
```

A unified recent feed across conversations, summaries, notes, todos, and insights. Good for "what have I been up to lately" at a glance.

## Searching - Prefer Over Manual Scanning

`bee search` runs server-side and is the right tool for topic/recall questions. Do **not** list every conversation and read it yourself when you can search.

```bash
bee search --query "marathon training" [--limit N] [--since <epochMs>] [--until <epochMs>] [--json]
```

Two modes:

- **Keyword (default):** BM25 over conversations, daily summaries, and facts.
  - `--filter conversations|daily|facts|all` (default `all`) - scope what is searched.
  - `--scope conversations|all` - alias that maps onto `--filter`.
  - `--sort relevance|mostRecent` (default `relevance`); `--sortBy` is an accepted alias.
- **Semantic / neural (`--neural`):** vector search over **conversations only**. The keyword-only flags (`--filter`/`--scope`/`--sort`/`--sortBy`) are rejected in this mode. Use it for fuzzy/conceptual recall ("find when I talked about feeling burned out").

`--since` and `--until` (epoch milliseconds) bound results by time and work in **both** modes.

```bash
bee search --query "project atlas deadline" --filter conversations --sort mostRecent
bee search --query "how I felt about the move" --neural --limit 10
bee search --query "dentist" --filter facts
```

Note: `--cursor` is **not** supported by search and will error; use `--since`/`--until` to page through time instead. Todos and insights are not searchable here - use `bee todos list` and `bee insights list`.

## Facts - Learn About the Owner

Facts are what Bee has learned about the owner from conversations - the primary way to understand who they are.

**Confirmed vs. unconfirmed:**
- **Confirmed facts** are verified by the owner or clearly stated. Trust them.
- **Unconfirmed facts** are inferred from context and may be misinterpretations. Use for context/speculation only, and flag the uncertainty when you act on them.

Prefer confirmed facts. List unconfirmed-only with `--unconfirmed`.

```bash
bee facts list [--limit N] [--cursor <cursor>] [--unconfirmed] [--json]
bee facts get <id> [--json]
bee facts search --query "allergies" [--limit N] [--json]
bee facts create --text "I prefer morning meetings" [--json]
bee facts update <id> --text "Updated text" [--confirmed <true|false>] [--json]
bee facts delete <id> [--json]
```

`facts update` requires `--text`; pass `--confirmed true` or `--confirmed false` to also change the confirmation state. Use `bee facts search` rather than paging through `facts list` when looking for something specific.

## Conversations - Access Transcripts

Conversations are records of captured ambient audio.

```bash
bee conversations list [--limit N] [--cursor <cursor>] [--json]
bee conversations get <id> [--json]
bee conversations transcript <id> [--json]
bee conversations related <id> [--limit N] [--json]   # --limit max 10
```

- `list` returns **summaries only** - browse to find relevant conversations. The response includes `next_cursor` for paging.
- `get` returns the full conversation: utterances (verbatim, with speaker and timestamps), state, and metadata.
- `transcript` returns just the verbatim utterance transcript for one conversation.
- `related` finds conversations similar to a given one - useful for assembling all discussions on a thread/topic.

**For accuracy, read utterances** from `get`/`transcript`. Summaries from `list` are for browsing only.

For topic search, prefer `bee search` over listing everything manually.

## Daily Summaries

```bash
bee daily list [--limit N] [--cursor <cursor>] [--json]   # browse day-by-day
bee daily get <id> [--json]
bee daily find <YYYY-MM-DD> [--json]                      # look up a specific date
```

There is no bare `bee daily` and no `--date` flag. To get a specific day, use `bee daily find 2026-06-01`.

## Journals - Voice Memos

Journals are intentional voice memos the owner records (distinct from ambient conversations). Aka voice notes.

```bash
bee journals list [--limit N] [--cursor <cursor>] [--json]
bee journals search --query "ideas for the talk" [--limit N] [--json]
bee journals get <id> [--json]
```

`list` returns entries with id, state (`PREPARING` = recording, `ANALYZING` = processing, `READY` = complete), transcribed text, and timestamps. `get` returns the full transcribed text. Use `journals search` to find a memo by content.

## Insights

AI-generated patterns and observations about the owner.

```bash
bee insights list [--limit N] [--json]   # --limit max 50
bee insights get <id> [--json]
```

Use when the user wants higher-level patterns rather than raw conversations.

## Locations

Where the owner has been.

```bash
bee locations recent [--from <date>] [--to <date>] [--limit N] [--json]   # --limit max 100
bee locations clusters [--limit N] [--min-visits N] [--visits] [--json]   # frequent places; --limit max 20
bee locations current [--json]                                            # latest known location
```

`--from`/`--to` accept `YYYY-MM-DD` or an ISO timestamp (owner's timezone). `clusters` groups frequently visited places; `--min-visits N` filters by visit count and `--visits` includes per-visit detail. Use for "where was I on ...", "what places do I go", "where am I now".

## Photos

Photos captured by the device.

```bash
bee photos list [--daily-id N] [--date YYYY-MM-DD] [--limit N] [--json]   # --limit max 20
bee photos get <id> [--output PATH] [--json]
```

Scope `list` by a daily summary id or by date. `get` retrieves a single photo; pass `--output PATH` to save it to disk.

## Todos - Track Commitments

Action items and commitments, including ones Bee suggests from conversations.

```bash
bee todos list [--limit N] [--cursor <cursor>] [--json]
bee todos get <id> [--json]
bee todos create --text "Buy groceries" [--alarm-at <iso>] [--json]
bee todos update <id> [--text "Updated"] [--completed <true|false>] [--alarm-at <iso> | --clear-alarm] [--json]
bee todos complete <id> [--json]
bee todos delete <id> [--json]
```

- `--completed` **takes a value**: `--completed true` or `--completed false`. To simply mark done, use the dedicated `bee todos complete <id>`.
- On `update`, set a reminder with `--alarm-at <iso>` or remove one with `--clear-alarm` (mutually exclusive).

**Suggestions workflow** - Bee proposes todos from conversations; review and act on them:

```bash
bee todos suggestions [--limit N] [--json]      # --limit max 50; list proposed todos
bee todos accept-suggestion <id> [--json]       # promote a suggestion to a real todo
bee todos dismiss-suggestion <id> [--json]      # reject a suggestion
```

## Monitoring Changes - `bee changed` vs `bee sync`

Two ways to stay current. Choose based on whether you want to *know what changed* or *have a complete local copy*.

### `bee changed` - incremental changefeed (know what's new)

Best for periodic checks: it tells you exactly what changed and gives a cursor to resume from. Defaults to roughly the last 24 hours when no cursor is given.

```bash
bee changed [--cursor <cursor>] [--json]
```

Returns the covered time range, a `Next Cursor:` line (and `next_cursor` in JSON), and the changed facts, todos, daily summaries, conversations, and journals (new and updated).

**Cursor handling** - persist the cursor only **after** you finish processing the batch, so a failure lets you retry the same changes (exactly-once processing):

1. Read the stored cursor from `.bee-cursor` (if it exists). *(`.bee-cursor` is a convention this skill uses, not a CLI feature.)*
2. Run `bee changed --cursor <cursor>` (omit `--cursor` on the first run).
3. Note the `Next Cursor:` value but do **not** save it yet.
4. Process all returned changes (update notes, handle todos, etc.).
5. Only after success, save the new cursor: `echo "<value>" > .bee-cursor`.
6. Repeat.

### `bee sync` - export to local markdown (have a copy)

Exports Bee data to markdown files for offline backup, full-text search, or feeding other tools.

```bash
bee sync [--output <dir>] [--recent-days N] [--full] [--since <epochMs>] [--only <facts|todos|daily|conversations>]
```

- **Incremental by default.** Re-runs re-fetch only changed daily summaries and conversations using a `.bee-sync.json` manifest stored in the output dir (facts and todos are always fully re-fetched). The first run is a full sync.
- `--output <dir>` - output directory (default `bee-sync`).
- `--full` - force a complete re-sync, ignoring the manifest.
- `--since <epochMs>` - advanced/recovery override of the saved incremental cursor.
- `--recent-days N` - limit daily/conversations to the last N days. **Applies to full syncs only** (first run or `--full`); ignored on incremental re-runs.
- `--only <list>` - sync only some types: `facts`, `todos`, `daily`, `conversations` (comma-separated).

**Note:** sync does not reconcile deletions (removed items are not pruned locally). If you need to know precisely *what changed* rather than maintain a mirror, use `bee changed`.

## Common Workflows

### Quick context about the owner

Run in this order:
```bash
bee now            # last 10h with full utterances - most important
bee facts list     # who the owner is: preferences, relationships, work
bee today --context  # today's aggregated wearable context
```

`bee now` makes help relevant and timely; facts and today's context fill in the bigger picture.

### Find something from a past conversation

Prefer search over manual scanning:
```bash
bee search --query "the topic or person" --filter conversations --sort mostRecent
bee conversations get <id>     # read verbatim utterances for the best hit
```

If recall is fuzzy/conceptual, use `--neural`. Use `bee conversations related <id>` to gather the rest of a thread.

### Where was I / where do I go

```bash
bee locations current
bee locations recent --from 2026-06-01 --to 2026-06-06
bee locations clusters --min-visits 5 --visits
```

### Export all data for AI context

```bash
bee sync --output ./my-bee-data
```

Creates markdown for facts, todos, daily summaries, and conversation transcripts; re-run to incrementally update.

## Deep Learning About the Owner

To build comprehensive knowledge of the owner by processing their full conversation history, use this multi-agent workflow. It processes conversations in batches via a chain of subagents, passing state through files to preserve context.

Each subagent: fetches a batch of conversations, reads the current `user.md`, extracts insights, updates `user.md`, writes a handoff summary, and spawns the next subagent for older conversations.

> Tip: for targeted questions, `bee search` is usually faster than a full deep-learning pass. Use deep learning only when you genuinely need the whole history.

### File Structure

In the working directory:
- `user.md` - cumulative profile of the owner (persistent, updated each batch).
- `bee-learning-summary.md` - handoff: latest summary plus the `next_cursor` for the next batch.
- `bee-learning-progress.md` - progress log of what was processed and when.

### Step 1: Initialize (Main Agent)

Create `user.md` if absent:
```markdown
# User Profile

Learned information about the owner from their Bee conversations.

## Basic Information
## Relationships
## Work & Projects
## Interests & Hobbies
## Preferences
## Important Dates & Events
## Notes
```

### Step 2: First Processing Subagent

Spawn a subagent with this task:

```
Process Bee conversations to learn about the owner.

1. Fetch the 100 most recent conversations (use --json to parse reliably):
   bee conversations list --limit 100 --json

2. Read the current user.md file.

3. For each conversation, extract: who the owner talked to (relationships),
   topics (interests, work), personal details (preferences, facts),
   commitments made, and important dates/events.

4. Update user.md, merging (do not overwrite) and adding timestamps.

5. Write bee-learning-summary.md with: date range processed, key insights,
   the next_cursor value from the API response, and running count.

6. Update bee-learning-progress.md.

7. If next_cursor is non-null, spawn the next subagent to continue with
   older conversations. Pass only file paths, not content.
```

### Step 3: Chain Processing Subagents

Each subsequent subagent:

```
Continue processing Bee conversations to learn about the owner.

1. Read bee-learning-summary.md to get the next_cursor for the next batch.

2. Fetch the next 100 conversations:
   bee conversations list --limit 100 --cursor <next_cursor_from_summary> --json

3. Read user.md.

4. Extract insights as before.

5. Update user.md (merge, do not overwrite).

6. Update bee-learning-summary.md with: new date range, new insights,
   the new next_cursor (or "complete" if null), updated total count.

7. Update bee-learning-progress.md.

8. If next_cursor is non-null, spawn the next subagent. If null (end reached),
   write the final summary and report completion.
```

### Step 4: Progress Reporting

After roughly each week's worth of conversations, report to the main conversation: what was learned, notable events, and significant profile changes. This keeps the user informed without overwhelming detail.

### Conversation List API

```bash
bee conversations list --limit 100 --json
bee conversations list --limit 100 --cursor <next_cursor> --json
```

The response includes a `conversations` array and a `next_cursor` field (null when there is no more data). Page by passing the previous `next_cursor` back via `--cursor`.

### Best Practices

1. **File-based handoff** - pass state between subagents via files, never by copying large text into prompts.
2. **Incremental merge** - each subagent merges into `user.md` with clear headers and timestamps; never replace it.
3. **Progress tracking** - keep `bee-learning-progress.md` so you can resume after interruption.
4. **Periodic summaries** - report meaningfully (e.g., per week processed), not after every batch.
5. **Graceful completion** - when `next_cursor` is null, write a final summary and notify the user.
6. **Error handling** - on failure, the next attempt reads the progress files and resumes.

### When to Use Deep Learning

Use it when: first establishing a relationship with a new user; the user requests a comprehensive history analysis; building context for a long-term assistant relationship; the user wants to understand patterns in their own conversations.

Do **not** use it for: quick questions about recent events (use `bee now`, `bee daily find`, or `bee activity`); looking up specific facts (use `bee facts list` / `bee facts search`); finding a particular conversation (use `bee search`).

## MCP Server

The `bee` CLI is also an MCP server, so Bee tools can be exposed directly to MCP-aware clients.

```bash
bee mcp serve                              # stdio JSON-RPC server
bee mcp serve-http --token <value> [--port N]   # HTTP server; token >= 32 chars (or env BEE_MCP_HTTP_TOKEN)
bee mcp connect <claude|claude-code|codex>       # register Bee with a client
bee mcp disconnect <claude|claude-code|codex>
bee mcp status
```

## Utility Commands

```bash
bee me [--json]            # authenticated profile
bee status                 # auth status
bee version [--json]
bee ping [--count N]       # connectivity check
bee stream [--types <list>] [--json] [--agent] [--webhook-endpoint <url> --webhook-body <template>]
bee proxy [--port N] [--socket [path]] [--idle-timeout SECONDS]
```
