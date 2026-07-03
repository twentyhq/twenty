# Document Generator

A [Twenty](https://twenty.com) app that turns reusable templates into personalized
documents using the data already in your CRM. It is the app built in the
[Document Generator tutorial](https://docs.twenty.com/developers/extend/apps/tutorials/document-generator/overview).

## What it does

- **Document templates** — write a template once with `{{placeholders}}` like
  `{{name.firstName}}` or `{{jobTitle}}`.
- **Documents** — generate a filled-in document from a template and a Person or
  Company record, in one click.
- **Generate anywhere** — from the command menu on a record, from an AI agent,
  or as a step in a workflow.
- **Share** — open any generated document as a printable web page.

## Capabilities used

| Capability | Files |
| --- | --- |
| Objects, fields & relations | `src/objects/`, `src/fields/` |
| Logic function (AI tool + workflow action) | `src/logic-functions/generate-document.ts` |
| HTTP routes | `src/logic-functions/generate-document-route.ts`, `view-document.ts` |
| Front component + command menu | `src/front-components/`, `src/command-menu-items/` |
| Views & navigation | `src/views/`, `src/navigation-menu-items/` |
| Agent & skill | `src/agents/`, `src/skills/` |
| Role | `src/roles/` |

## Getting started

```bash
yarn install
yarn twenty docker:start                 # start a local Twenty server
yarn twenty remote:add --url http://localhost:2020 --as local
yarn twenty dev                          # build, sync, and watch
```

Open your Twenty instance and look for **Templates** and **Documents** in the
sidebar.

## Commands

- `yarn twenty dev` — build, sync, and watch for changes
- `yarn lint` — lint with oxlint
- `yarn typecheck` — type-check the project
- `yarn test:unit` — run unit tests
- `yarn test` — run integration tests (requires a running server)

## Learn more

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
