<p align="center">
  <a href="https://www.twenty.com">
    <img src="./packages/twenty-website/public/images/core/logo.svg" width="100px" alt="Twenty logo" />
  </a>
</p>

<h2 align="center" >The #1 Open-Source CRM</h2>

<p align="center"><a href="https://twenty.com"><img src="./packages/twenty-website/public/images/readme/globe-icon.svg" width="12" height="12"/> Website</a> · <a href="https://docs.twenty.com"><img src="./packages/twenty-website/public/images/readme/book-icon.svg" width="12" height="12"/> Documentation</a> · <a href="https://github.com/orgs/twentyhq/projects/1"><img src="./packages/twenty-website/public/images/readme/map-icon.svg" width="12" height="12"/> Roadmap </a> · <a href="https://discord.gg/cx5n4Jzs57"><img src="./packages/twenty-website/public/images/readme/discord-icon.svg" width="12" height="12"/> Discord</a> · <a href="https://www.figma.com/file/xt8O9mFeLl46C5InWwoMrN/Twenty"><img src="./packages/twenty-website/public/images/readme/figma-icon.png"  width="12" height="12"/>  Figma</a></p>

<p align="center">
  <a href="https://www.twenty.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/github-cover-dark.png" />
      <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/github-cover-light.png" />
      <img src="./packages/twenty-website/public/images/readme/github-cover-light.png" alt="Twenty banner" />
    </picture>
  </a>
</p>

<br />

# Why Twenty

AI turned CRM into the system that runs your go-to-market, and every team on the same SaaS gets the same agent decisions. Twenty is the CRM you build, ship, and version like the rest of your stack.

<br />

# Installation

### <img src="./packages/twenty-website/public/images/readme/globe-icon.svg" width="14" height="14"/> Cloud

The fastest way to get started. Sign up at [twenty.com](https://twenty.com) and spin up a workspace in under a minute — no infrastructure to manage, always up to date.

### <img src="./packages/twenty-website/public/images/readme/book-icon.svg" width="14" height="14"/> Build an app

Scaffold a new app with the Twenty CLI:

```bash
npx create-twenty-app my-app
```

Define objects, fields, and views as code:

```ts
import { defineObject, FieldType } from 'twenty-sdk/define';

export default defineObject({
  nameSingular: 'deal',
  namePlural: 'deals',
  labelSingular: 'Deal',
  labelPlural: 'Deals',
  fields: [
    { name: 'name', label: 'Name', type: FieldType.TEXT },
    { name: 'amount', label: 'Amount', type: FieldType.CURRENCY },
    { name: 'closeDate', label: 'Close Date', type: FieldType.DATE_TIME },
  ],
});
```

Then ship it to your workspace:

```bash
npx twenty deploy
```

See the [app development guide](https://docs.twenty.com/developers/extend/apps/getting-started) for objects, views, agents, and logic functions.

### <img src="./packages/twenty-website/public/images/readme/rocket-icon.svg" width="14" height="14"/> Self-hosting

Run Twenty on your own infrastructure with [Docker Compose](https://docs.twenty.com/developers/self-host/capabilities/docker-compose), or contribute locally via the [local setup guide](https://docs.twenty.com/developers/contribute/capabilities/local-setup).

# What you can build

Twenty gives you the building blocks of a modern CRM — objects, views, workflows, and agents — and lets you extend them as code. Here's a tour of what's in the box.

<table align="center">
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-build-apps-dark.png" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-build-apps-light.png" />
        <img src="./packages/twenty-website/public/images/readme/v2-build-apps-light.png" alt="Create your apps" />
      </picture>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-version-control-dark.png" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-version-control-light.png" />
        <img src="./packages/twenty-website/public/images/readme/v2-version-control-light.png" alt="Stay on top with version control" />
      </picture>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-all-tools-dark.png" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-all-tools-light.png" />
        <img src="./packages/twenty-website/public/images/readme/v2-all-tools-light.png" alt="All the tools you need to build anything" />
      </picture>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-tools-dark.png" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-tools-light.png" />
        <img src="./packages/twenty-website/public/images/readme/v2-tools-light.png" alt="Customize your layouts" />
      </picture>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-ai-agents-dark.png" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-ai-agents-light.png" />
        <img src="./packages/twenty-website/public/images/readme/v2-ai-agents-light.png" alt="AI agents and chats" />
      </picture>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-crm-tools-dark.png" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-crm-tools-light.png" />
        <img src="./packages/twenty-website/public/images/readme/v2-crm-tools-light.png" alt="Plus all the tools of a good CRM" />
      </picture>
    </td>
  </tr>
</table>

<br />

# Stack
- <img src="https://cdn.simpleicons.org/typescript" width="14" height="14"/> [TypeScript](https://www.typescriptlang.org/)
- <img src="https://cdn.simpleicons.org/nx" width="14" height="14"/> [Nx](https://nx.dev/)
- <img src="https://cdn.simpleicons.org/nestjs" width="14" height="14"/> [NestJS](https://nestjs.com/), with <img src="https://cdn.simpleicons.org/bull" width="14" height="14"/> [BullMQ](https://bullmq.io/), <img src="https://cdn.simpleicons.org/postgresql" width="14" height="14"/> [PostgreSQL](https://www.postgresql.org/), <img src="https://cdn.simpleicons.org/redis" width="14" height="14"/> [Redis](https://redis.io/)
- <img src="https://cdn.simpleicons.org/react" width="14" height="14"/> [React](https://reactjs.org/), with <img src="https://cdn.simpleicons.org/jotai" width="14" height="14"/> [Jotai](https://jotai.org/), <img src="https://cdn.simpleicons.org/styledcomponents" width="14" height="14"/> [Linaria](https://linaria.dev/) and <img src="https://cdn.simpleicons.org/googletranslate" width="14" height="14"/> [Lingui](https://lingui.dev/)



# Thanks

<p align="center">
  <a href="https://www.chromatic.com/"><img src="./packages/twenty-website/public/images/readme/chromatic.png" height="30" alt="Chromatic" /></a>
  <a href="https://greptile.com"><img src="./packages/twenty-website/public/images/readme/greptile.png" height="30" alt="Greptile" /></a>
  <a href="https://sentry.io/"><img src="./packages/twenty-website/public/images/readme/sentry.png" height="30" alt="Sentry" /></a>
  <a href="https://crowdin.com/"><img src="./packages/twenty-website/public/images/readme/crowdin.png" height="30" alt="Crowdin" /></a>
  <a href="https://e2b.dev/"><img src="./packages/twenty-website/public/images/readme/e2b.svg" height="30" alt="E2B" /></a>
</p>

  Thanks to these amazing services that we use and recommend for UI testing (Chromatic), code review (Greptile), catching bugs (Sentry) and translating (Crowdin).


# Join the Community

<p><a href="https://github.com/twentyhq/twenty"><img src="./packages/twenty-website/public/images/readme/star-icon.svg" width="12" height="12"/> Star the repo</a> · <a href="https://discord.gg/cx5n4Jzs57"><img src="./packages/twenty-website/public/images/readme/discord-icon.svg" width="12" height="12"/> Discord</a> · <a href="https://github.com/twentyhq/twenty/discussions"><img src="./packages/twenty-website/public/images/readme/message-icon.svg" width="12" height="12"/> Feature requests</a> · <a href="https://github.com/orgs/twentyhq/projects/1/views/35"><img src="./packages/twenty-website/public/images/readme/rocket-icon.svg" width="12" height="12"/> Releases</a> · <a href="https://twitter.com/twentycrm"><img src="./packages/twenty-website/public/images/readme/x-icon.svg" width="12" height="12"/> X</a> · <a href="https://www.linkedin.com/company/twenty/"><img src="./packages/twenty-website/public/images/readme/linkedin-icon.svg" width="12" height="12"/> LinkedIn</a> · <a href="https://twenty.crowdin.com/twenty"><img src="./packages/twenty-website/public/images/readme/language-icon.svg" width="12" height="12"/> Crowdin</a> · <a href="https://github.com/twentyhq/twenty/contribute"><img src="./packages/twenty-website/public/images/readme/code-icon.svg" width="12" height="12"/> Contribute</a></p>
