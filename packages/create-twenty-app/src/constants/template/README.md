# My Twenty App

Describe your app in one or two sentences.

## Features

List the top things your app does, for example:

- Feature one
- Feature two
- Feature three

## Getting started

Setup instructions live in [SETUP.md](SETUP.md).

## Publishing

The CD workflow (`.github/workflows/cd.yml`) deploys your app to a Twenty server. It also ships a commented-out `publish-to-npm` job that publishes the app to npm with provenance using [npm trusted publishing](https://docs.npmjs.com/trusted-publishers). To publish to npm:

1. Uncomment the `publish-to-npm` job in `.github/workflows/cd.yml`, and the `id-token: write` permission at the top of that file.
2. Register this repository as a trusted publisher of your package on npmjs.com, pointing at the `cd.yml` workflow.
3. Bump the version in `package.json` and merge to `main`.

Publishing with provenance is also how you prove ownership when claiming your app in a Twenty marketplace.

## Changelog

Notable changes are documented in [CHANGELOG.md](CHANGELOG.md).

## Learn more

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
- [Discord](https://discord.gg/cx5n4Jzs57)
