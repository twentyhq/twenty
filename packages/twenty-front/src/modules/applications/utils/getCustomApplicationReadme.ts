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

**Free**: no credits, no metering.`;
