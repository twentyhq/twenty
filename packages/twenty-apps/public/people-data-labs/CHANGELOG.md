# Changelog

All notable changes to this application are documented in this file.

## 1.4.0

- Add **Required fields for people matches** and **Required fields for company
  matches** app settings. A match only counts, and is only billed, when every
  selected output field is present. Both are empty by default.
- Add a **Required fields for a match** input to the enrichment workflow steps.
  An empty selection uses the app setting. Refreshing a record that already has
  a PDL ID skips the requirements. Twenty versions without the multiselect
  show a text list that accepts field labels or PDL field names.

## 1.3.0

- Lower enrichment prices to $0.15 per person match and $0.075 per company match.

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
