import { t } from '@lingui/core/macro';

export const getCustomApplicationReadme =
  (): string => t`Everything you build directly in this workspace lives here. Every object, field, view or automation you add on top of the Standard app is grouped under Custom, so your schema changes, interface changes and workspace-specific logic stay in one place.

## ✨ What you get

- **Custom objects and fields**: your own data model, next to the standard objects
- **Views, navigation items and record layouts**: the screens that shape how your team works
- **Logic functions, front components and agents**: automation and extensions specific to this workspace

## 📌 Good to know

- Created with your workspace and unique to it
- Cannot be uninstalled: it holds your workspace's customizations
- Customizations you make from the Twenty interface are saved here automatically

## 💳 Billing

**Free**: no credits, no metering.

## 🛠️ Build a dedicated app

Keep workspace-specific customization here. If you are building something reusable, with its own data model, UI and automation that should be versioned, shared or installed across workspaces, create a dedicated app instead. Scaffold one in a single command:

\`\`\`bash
npx create-twenty-app@latest my-twenty-app
\`\`\`

See the [Getting Started guide](https://twenty.com/developers/extend/apps/getting-started) for the full walkthrough, and [Building Apps](https://twenty.com/developers/extend/apps/building) for the \`defineApplication\` / \`defineEntity\` APIs.`;
