# Postcard App — Twenty App Example

A rich example app showcasing all Twenty app entity types. Use this as a reference when building your own apps.

## What's included

This app demonstrates every entity type available in the Twenty SDK:

| Entity | Files | What it shows |
|--------|-------|---------------|
| **Application** | `src/application.config.ts` | App metadata, application variables, server variables |
| **Objects** | `src/objects/` | Custom objects with inline fields, junction tables |
| **Fields** | `src/fields/` | Standalone fields, relations (ONE_TO_MANY, MANY_TO_ONE), extending standard objects |
| **Logic Functions** | `src/logic-functions/` | HTTP routes, database event triggers, cron schedules, tool functions, install hooks |
| **Front Components** | `src/components/` | React components rendered inside Twenty's UI |
| **Roles** | `src/roles/` | Permission roles with object and field-level access control |
| **Views** | `src/views/` | Saved table views with column configuration |
| **Navigation** | `src/navigation-menu-items/` | Sidebar links targeting views |
| **Skills** | `src/skills/` | AI skill providing context to agents |
| **Agents** | `src/agents/` | AI agent with a system prompt |
| **Page Layouts** | `src/page-layouts/` | Custom record page with a front component widget |

## Getting started

```bash
# From this directory
yarn install
yarn twenty dev
```

Or use it as a template via create-twenty-app:

```bash
npx create-twenty-app@latest my-app --example postcard
```

## Learn more

- [Getting Started](https://docs.twenty.com/developers/extend/apps/getting-started)
- [Building Apps](https://docs.twenty.com/developers/extend/apps/building)
- [Publishing](https://docs.twenty.com/developers/extend/apps/publishing)
- [Discord](https://discord.gg/cx5n4Jzs57)
