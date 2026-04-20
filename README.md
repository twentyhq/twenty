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

<table align="center">
  <tr>
    <td width="33%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-build-apps-dark.png" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-build-apps-light.png" />
        <img src="./packages/twenty-website/public/images/readme/v2-build-apps-light.png" alt="Create your apps" />
      </picture>
    </td>
    <td width="33%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-version-control-dark.png" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-version-control-light.png" />
        <img src="./packages/twenty-website/public/images/readme/v2-version-control-light.png" alt="Stay in control" />
      </picture>
    </td>
    <td width="33%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-tools-dark.png" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-tools-light.png" />
        <img src="./packages/twenty-website/public/images/readme/v2-tools-light.png" alt="All the tools" />
      </picture>
    </td>
  </tr>
  <tr>
    <td width="33%"></td>
    <td width="33%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-ai-agents-dark.png" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-ai-agents-light.png" />
        <img src="./packages/twenty-website/public/images/readme/v2-ai-agents-light.png" alt="AI" />
      </picture>
    </td>
    <td width="33%">
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

<p>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://nx.dev/"><img src="https://img.shields.io/badge/Nx-143055?style=flat&logo=nx&logoColor=white" alt="Nx" /></a>
  <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white" alt="NestJS" /></a>
  <a href="https://bullmq.io/"><img src="https://img.shields.io/badge/BullMQ-E74C3C?style=flat&logo=bull&logoColor=white" alt="BullMQ" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://redis.io/"><img src="https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white" alt="Redis" /></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React" /></a>
  <a href="https://jotai.org/"><img src="https://img.shields.io/badge/Jotai-000000?style=flat&logo=jotai&logoColor=white" alt="Jotai" /></a>
  <a href="https://linaria.dev/"><img src="https://img.shields.io/badge/Linaria-2E2E2E?style=flat&logo=styledcomponents&logoColor=white" alt="Linaria" /></a>
  <a href="https://lingui.dev/"><img src="https://img.shields.io/badge/Lingui-EF4444?style=flat&logo=translate&logoColor=white" alt="Lingui" /></a>
</p>



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

<p>
  <a href="https://github.com/twentyhq/twenty"><img src="https://img.shields.io/github/stars/twentyhq/twenty?style=flat&logo=github&logoColor=white&color=181717&label=Star" alt="Star the repo" /></a>
  <a href="https://discord.gg/cx5n4Jzs57"><img src="https://img.shields.io/badge/Discord-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="https://github.com/twentyhq/twenty/discussions"><img src="https://img.shields.io/badge/Feature%20requests-181717?style=flat&logo=github&logoColor=white" alt="Feature requests" /></a>
  <a href="https://github.com/orgs/twentyhq/projects/1/views/35"><img src="https://img.shields.io/badge/Releases-16A34A?style=flat&logo=github&logoColor=white" alt="Releases" /></a>
  <a href="https://twitter.com/twentycrm"><img src="https://img.shields.io/badge/X-000000?style=flat&logo=x&logoColor=white" alt="X" /></a>
  <a href="https://www.linkedin.com/company/twenty/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn" /></a>
  <a href="https://twenty.crowdin.com/twenty"><img src="https://img.shields.io/badge/Crowdin-2E3340?style=flat&logo=crowdin&logoColor=white" alt="Crowdin" /></a>
  <a href="https://github.com/twentyhq/twenty/contribute"><img src="https://img.shields.io/badge/Contribute-EA4AAA?style=flat&logo=github&logoColor=white" alt="Contribute" /></a>
</p>
