# When to Use

Use this when the user wants to design or polish a Twenty front component UI.

Examples:

- Make a front component look better.
- Create a clean layout for a front component.
- Improve loading, empty, error, or disabled states.
- Make a front component responsive and easier to scan.

# Boundaries

Do not scaffold a new app here. Use `create-app` first when the app does not exist.

Do not use this reference for source files, registration, runtime imports, data access, CLI commands, or browser verification.

# Design Rules

Design front components as compact product UI, not marketing pages.

Use restrained spacing, clear hierarchy, predictable controls, and stable dimensions. Keep cards at 8px radius or less unless the app already uses a different convention.

Include the states a user expects: loading, empty, error, disabled, and success when relevant.

Keep text short and make sure it fits in narrow component widths. Do not let labels, buttons, or dynamic values overlap.

Reuse existing project components, tokens, and styling patterns before adding new ones.

## Twenty UI Defaults

Prefer Twenty UI primitives for CRM-native front component UI:

- Use `H2Title` or `H3Title` for compact section headings.
- Use `Callout` with a matching icon for loading, empty, error, and blocked states.
- Use `Button` for primary and secondary actions.
- Use `Tag`, `Status`, `Chip`, `Label`, and `Avatar` for metadata, state, people, and small summaries.
- Use `themeCssVariables` for spacing, colors, border radius, typography, and borders.

Use local inline styles for layout containers and custom data displays, but keep them aligned with Twenty tokens. Use `front-components.md` for exact imports and runtime rules.

# Workflow

First, identify the target front component file and the user workflow it supports.

Design the visible states the user will naturally encounter: loading, empty, error, disabled, success, and the primary working state.
