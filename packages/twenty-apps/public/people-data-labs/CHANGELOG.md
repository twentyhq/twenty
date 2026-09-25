# Changelog

All notable changes to this application are documented in this file.

## 1.2.0

- Move the minimum match likelihoods for people and companies from server
  variables to the app settings, so workspace admins can edit them. Values set
  as server variables are not migrated and reset to the default of 2.
- Add settings for name-based people and company matches, defaulting to 6.
  Name-based matches use the higher of this setting and the people or company
  minimum.
- Add a **Minimum likelihood for name-based matches** input to the enrichment
  workflow steps. Explicit workflow inputs take precedence over the app
  settings.
- Require Twenty `>=2.36.0`: labels for app settings only exist from 2.36.
