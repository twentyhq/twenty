# Exa

Structured web search powered by [Exa](https://exa.ai), available to Twenty's AI agents as the `exa_web_search` tool. When an agent needs fresh, entity-aware information from the web (companies, people, research, news, and more), it can call Exa directly from chat and answer with live results.

## What it does

This app adds a single AI tool, `exa_web_search`, to your workspace. Twenty AI agents can invoke it to run a search through Exa and receive structured, entity-aware results. It is designed to surface high-quality matches for companies, people, research papers, news, and similar entities rather than generic page links.

The tool reads no workspace data. It only uses the search query the agent provides and your configured Exa API key, calling Exa's external API to return results.

## How agents use it

The tool accepts the following inputs:

- **query** (required) — the search query to send to Exa.
- **category** (optional) — narrows results to a specific type. Supported values: `company`, `research paper`, `news`, `pdf`, `personal site`, `financial report`, `people`. When omitted, Exa searches across all types.
- **numResults** (optional) — how many results to return, between `1` and `30`. Defaults to `10`.

Agents choose these values automatically based on what they are trying to find, so no manual configuration is needed once the app is set up.

## Setup

The app requires an Exa API key, configured once by the server administrator:

- **EXA_API_KEY** (required, secret) — your Exa API key. It is set on the app after installation and injected into every search. There is no per-workspace configuration; the same key serves all searches.

If the key is not set, searches fail with an error until an administrator provides it.

## Billing

Each successful search consumes credits, mirroring Exa's auto-search pricing: a base cost of **$0.007** covers the first 10 results, plus **$0.001** for each additional result. Charges are based on the number of results actually returned, not the number requested.

## Limitations

- Returns at most 30 results per search.
- Results come live from Exa's external API, so the app depends on Exa's availability and on a valid API key being configured.
- The tool only performs web search; it does not read from or write to your workspace data.
