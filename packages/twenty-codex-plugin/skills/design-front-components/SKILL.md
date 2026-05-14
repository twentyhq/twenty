---
name: design-front-components
description: Use when the user wants to design or improve the UI of a Twenty app front component.
---

# When to Use

Use this when the user wants to design, build, or polish a Twenty front component UI.

Examples:

- Make a front component look better.
- Create a clean layout for a front component.
- Improve loading, empty, error, or disabled states.
- Make a front component responsive and easier to scan.

# Boundaries

Do not scaffold a new app here. Use `create-an-app` first when the app does not exist.

Do not create app data models, roles, logic functions, views, or front component registrations here. Use `build-app-features` first when the component or app entity does not exist.

# Design Rules

Design front components as compact product UI, not marketing pages.

Use restrained spacing, clear hierarchy, predictable controls, and stable dimensions. Keep cards at 8px radius or less unless the app already uses a different convention.

Include the states a user expects: loading, empty, error, disabled, and success when relevant.

Keep text short and make sure it fits in narrow component widths. Do not let labels, buttons, or dynamic values overlap.

Reuse existing project components, tokens, and styling patterns before adding new ones.

# Workflow

First, identify the target front component file and the user workflow it supports.

If the component is missing, use `build-app-features` to create or register it.

After editing the UI, run the app workflow:

```bash
yarn twenty dev
```

Verify the component in the relevant Twenty surface when possible.
