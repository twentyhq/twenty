import { t } from '@lingui/core/macro';

export const getStandardApplicationReadme =
  (): string => t`Every Twenty workspace starts with this app. It defines the shape of your CRM: the core objects, how they relate to each other, and the views and record pages your team works in. Marketplace apps, AI agents and your own customizations all build on top of it.

## ✨ What you get

- **People & Companies**: your contacts and the accounts they belong to
- **Opportunities**: your sales pipeline, stage by stage
- **Notes & Tasks**: activity and follow-ups attached to any record
- **Emails & Calendar events**: synced from your connected accounts and linked to the right records
- **Workflows & Dashboards**: automation and reporting on top of your data

## 📌 Good to know

- Installed on every workspace and maintained by Twenty
- Cannot be uninstalled: the rest of the workspace is built on it
- Your own objects, fields and layouts live in the **Custom** app

## 💳 Billing

**Free**: no credits, no metering.`;
