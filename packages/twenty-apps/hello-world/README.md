# Hello world

A minimal hello-world application built with an alpha version of the twenty-cli.

⚠️ Since this project uses an early alpha release, expect breaking changes and evolving features.

This example will gradually gain complexity and capabilities as the twenty-cli matures with future updates.


## Requirements
- twenty-cli `npm install -g twenty-cli`
- an `apiKey`. Go to `/settings/api-webhooks` to generate one


## Install to your Twenty workspace

```bash
cp .env.example .env
```

- replace `<SET_YOUR_TWENTY_API_KEY>` and `<SET_YOUR_TWENTY_API_URL>` accordingly

```bash
twenty auth login
twenty app sync
```

## What it does
- creates a new object `postCard` with a `name` field
- creates a serverless function `create-new-post-card`
- two triggers on `create-new-post-card`:
  - one route trigger on `GET` `/post-card/create?recipient=RecipientName`
  - one databaseEvent trigger on `people.created` events

## Development

Run dev mode and see application updates on your workspace instantly

```bash
twenty app dev
```
