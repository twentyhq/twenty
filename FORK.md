# About this fork

Fork of [twentyhq/twenty](https://github.com/twentyhq/twenty) for a
self-hosted deployment, adding functionality upstream doesn't yet support.

Fork point: tag `twenty/v2.18.5`
(commit `7e046ce2a28367200bceb2e7faeb84d758519f1f`).

## What's customized

- **Validation Gate** — a pre-save write-blocking mechanism. See
  [`packages/twenty-server/src/engine/core-modules/validation-gate/README.md`](packages/twenty-server/src/engine/core-modules/validation-gate/README.md)
  for what it does and why it exists.

## Fork surface

Kept deliberately minimal — new files only, plus a 2-line change to one
existing file (`core-engine.module.ts`, to register the new module). The
goal is to keep re-applying these changes to a newer upstream version cheap.

## Working with this fork

- `upstream` remote = `twentyhq/twenty` (read-only, for pulling updates)
- `origin` remote = this fork (where changes are pushed)
- Feature work happens on branches off the fork point, not on `main`

This repository contains no credentials, hostnames, or environment-specific
configuration. Deployment configuration lives outside this repo.
