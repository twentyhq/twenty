<p align="center">
  <a href="https://crove.io">
    <img src="./packages/twenty-website/public/images/core/logo.svg" width="100px" alt="Crove CRM logo" />
  </a>
</p>

<h2 align="center">Crove CRM — The AI-Native Open-Source CRM (Twenty Fork)</h2>

<p align="center">
  <a href="https://crove.io"><img src="./packages/twenty-website/public/images/readme/globe-icon.svg" width="12" height="12"/> Crove Website</a> · 
  <a href="https://crm.crove.com"><img src="./packages/twenty-website/public/images/readme/star-icon.svg" width="12" height="12"/> Live App (crm.crove.com)</a> · 
  <a href="https://docs.twenty.com"><img src="./packages/twenty-website/public/images/readme/book-icon.svg" width="12" height="12"/> Twenty Documentation</a> · 
  <a href="https://github.com/twentyhq/twenty"><img src="./packages/twenty-website/public/images/readme/map-icon.svg" width="12" height="12"/> Upstream Repo</a>
</p>

<p align="center">
  <a href="https://crove.io">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/github-cover-dark.webp" />
      <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/github-cover-light.webp" />
      <img src="./packages/twenty-website/public/images/readme/github-cover-light.webp" alt="Crove CRM banner" />
    </picture>
  </a>
</p>

<br />

# Why Twenty & Why Crove CRM

**Twenty** gives technical teams the building blocks for a custom CRM that meets complex business needs and quickly adapts as the business evolves. Twenty is the CRM you build, ship, and version like the rest of your stack.

**Crove CRM** is an enhanced, production-ready fork of Twenty tailored for the **Crove Business OS** ecosystem with the following superpowers:
* 🤖 **AI-Native Engine (DOS.AI)**: Powered by Vercel AI SDK with pre-configured OpenAI-compatible gateway (`https://api.dos.ai/v1`, model `dos-auto`) for Ask AI Chat, AI Lead Enrichment, and Smart Workflow automation.
* 🌐 **Single Root Domain Multi-Tenancy**: Built-in support for running multi-organization CRM directly on `crm.crove.com` without dynamic wildcard DNS/SSL requirements (`IS_MULTIWORKSPACE_SUBDOMAIN_ENABLED=false`).
* 🛡️ **Unified DOS ID SSO (OAuth 2.1)**: Centralized identity and Just-In-Time (JIT) organization provisioning synced with `api.dos.me`.
* 🔄 **Ecosystem Event Router**: Real-time 2-way Webhook synchronization (`/webhooks/dos-org-sync`) for Companies, Customers, and Tickets between Crove CRM and Crove Desk.
* 📦 **Bundled Regional & Commerce Apps**: Built-in [Zalo OA](packages/twenty-apps/public/zalo-oa) (Chat, ZNS, Webhooks) and [Commerce](packages/twenty-apps/public/commerce) (Products, Orders, Order Items) apps.
* ☁️ **Zero-Egress Infrastructure**: Integrated Cloudflare R2 object storage, Brevo SMTP relay, and Supabase IPv4 connection pooler.

<a href="https://twenty.com/resources/why-twenty"><img src="./packages/twenty-website/public/images/readme/star-icon.svg" width="14" height="14"/> Learn more about why Twenty was built</a>

<br />

# Installation

### <img src="./packages/twenty-website/public/images/readme/globe-icon.svg" width="14" height="14"/> Cloud

Sign up and spin up a workspace in under a minute on [crm.crove.com](https://crm.crove.com) or [twenty.com](https://twenty.com), with no infrastructure to manage.

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
npx twenty app:publish --private
```

See the [app development guide](https://docs.twenty.com/developers/extend/apps/getting-started) for objects, views, agents, and logic functions.

Building with a coding agent? Install the official [Twenty app skills](./packages/twenty-agent-skills), which work in Claude Code, Codex, Cursor, Pi, and any other harness supported by the `skills` CLI:

```bash
npx skills add https://github.com/twentyhq/twenty/tree/agent-skills --list
```

The `agent-skills` branch is created by the first successful publish from `main`. Until then, use the [local build instructions](./packages/twenty-agent-skills#local-development). [`SKILLS.md`](./SKILLS.md) explains the other skill families in this repository and who they are for.

### <img src="./packages/twenty-website/public/images/readme/rocket-icon.svg" width="14" height="14"/> Self-hosting

Run Crove CRM on your own infrastructure with Docker Compose:

```bash
cd packages/twenty-docker
cp .env.example .env
docker compose up -d
```

<br />
<br />

# Everything you need

Twenty gives you the building blocks of a modern CRM (objects, views, workflows, and agents) and lets you extend them as code. Here's a tour of what's in the box.

Want to go deeper? Read the <a href="https://docs.twenty.com/user-guide/introduction"><img src="./packages/twenty-website/public/images/readme/planner-icon.svg" width="14" height="14"/> User Guide</a> for product walkthroughs, or the <a href="https://docs.twenty.com"><img src="./packages/twenty-website/public/images/readme/book-icon.svg" width="14" height="14"/> Documentation</a> for developer reference.

<table align="center">
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-build-apps-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-build-apps-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-build-apps-light.webp" alt="Create your apps" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/developers/extend/apps/getting-started"><img src="./packages/twenty-website/public/images/readme/code-icon.svg" width="16" height="16"/> Learn more about apps in doc</a></p>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-version-control-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-version-control-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-version-control-light.webp" alt="Stay on top with version control" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/developers/extend/apps/publishing"><img src="./packages/twenty-website/public/images/readme/monitor-icon.svg" width="16" height="16"/> Learn more about version control in doc</a></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-all-tools-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-all-tools-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-all-tools-light.webp" alt="All the tools you need to build anything" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/developers/extend/apps/building"><img src="./packages/twenty-website/public/images/readme/rocket-icon.svg" width="16" height="16"/> Learn more about primitives in doc</a></p>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-tools-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-tools-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-tools-light.webp" alt="Customize your layouts" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/user-guide/layout/overview"><img src="./packages/twenty-website/public/images/readme/planner-icon.svg" width="16" height="16"/> Learn more about layouts in doc</a></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-ai-agents-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-ai-agents-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-ai-agents-light.webp" alt="AI agents and chats" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/user-guide/ai/overview"><img src="./packages/twenty-website/public/images/readme/message-icon.svg" width="16" height="16"/> Learn more about AI in doc</a></p>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./packages/twenty-website/public/images/readme/v2-crm-tools-dark.webp" />
        <source media="(prefers-color-scheme: light)" srcset="./packages/twenty-website/public/images/readme/v2-crm-tools-light.webp" />
        <img src="./packages/twenty-website/public/images/readme/v2-crm-tools-light.webp" alt="Plus all the tools of a good CRM" />
      </picture>
      <p align="center"><a href="https://docs.twenty.com/user-guide/introduction"><img src="./packages/twenty-website/public/images/readme/star-icon.svg" width="16" height="16"/> Learn more about CRM features in doc</a></p>
    </td>
  </tr>
</table>

<br />

# Stack

- <a href="https://www.typescriptlang.org/"><img src="./packages/twenty-website/public/images/readme/stack-typescript.svg" width="14" height="14"/> TypeScript</a>
- <a href="https://nx.dev/"><img src="./packages/twenty-website/public/images/readme/stack-nx.svg" width="14" height="14"/> Nx</a>
- <a href="https://nestjs.com/"><img src="./packages/twenty-website/public/images/readme/stack-nestjs.svg" width="14" height="14"/> NestJS</a>, with <a href="https://bullmq.io/">BullMQ</a>, <a href="https://www.postgresql.org/"><img src="./packages/twenty-website/public/images/readme/stack-postgresql.svg" width="14" height="14"/> PostgreSQL</a>, <a href="https://redis.io/"><img src="./packages/twenty-website/public/images/readme/stack-redis.svg" width="14" height="14"/> Redis</a>
- <a href="https://reactjs.org/"><img src="./packages/twenty-website/public/images/readme/stack-react.svg" width="14" height="14"/> React</a>, with <a href="https://jotai.org/">Jotai</a>, <a href="https://linaria.dev/">Linaria</a> and <a href="https://lingui.dev/">Lingui</a>

# Thanks

<p align="center">
  <a href="https://greptile.com"><img src="./packages/twenty-website/public/images/readme/greptile.webp" height="28" alt="Greptile" /></a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://sentry.io/"><img src="./packages/twenty-website/public/images/readme/sentry.webp" height="28" alt="Sentry" /></a>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://crowdin.com/"><img src="./packages/twenty-website/public/images/readme/crowdin.webp" height="28" alt="Crowdin" /></a>
</p>

Thanks to these amazing services that we use and recommend for code review (Greptile), catching bugs (Sentry) and translating (Crowdin).

# Upstream Community & Contributions

<p><a href="https://github.com/twentyhq/twenty"><img src="./packages/twenty-website/public/images/readme/star-icon.svg" width="12" height="12"/> Star upstream Twenty</a> · <a href="https://discord.gg/cx5n4Jzs57"><img src="./packages/twenty-website/public/images/readme/discord-icon.svg" width="12" height="12"/> Discord</a> · <a href="https://github.com/twentyhq/twenty/discussions"><img src="./packages/twenty-website/public/images/readme/message-icon.svg" width="12" height="12"/> Feature requests</a> · <a href="https://github.com/orgs/twentyhq/projects/1/views/35"><img src="./packages/twenty-website/public/images/readme/rocket-icon.svg" width="12" height="12"/> Releases</a> · <a href="https://twitter.com/twentycrm"><img src="./packages/twenty-website/public/images/readme/x-icon.svg" width="12" height="12"/> X</a> · <a href="https://www.linkedin.com/company/twenty/"><img src="./packages/twenty-website/public/images/readme/linkedin-icon.svg" width="12" height="12"/> LinkedIn</a> · <a href="https://twenty.crowdin.com/twenty"><img src="./packages/twenty-website/public/images/readme/language-icon.svg" width="12" height="12"/> Crowdin</a> · <a href="https://github.com/twentyhq/twenty/contribute"><img src="./packages/twenty-website/public/images/readme/code-icon.svg" width="12" height="12"/> Contribute</a></p>
