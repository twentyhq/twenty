---
name: settings-page
description: Create a new settings page or section in twenty-front following the standard component hierarchy and routing patterns. Use when adding configuration UI under the Settings area.
---

# Settings Page Creation

**Purpose**: Step-by-step guide for adding a new settings page or section in the Twenty frontend.

**When to use**: When adding a new configuration area under Settings (e.g., a new tab, a new page, or a new section on an existing page).

---

## Settings Module Structure

Settings features live in `packages/twenty-front/src/modules/settings/`:

```
modules/settings/{feature}/
├── components/
│   ├── Settings{Feature}Content.tsx            # Main content component
│   ├── Settings{Feature}{Section}Section.tsx    # Section components
│   └── internal/                                # Private sub-components
├── hooks/
│   └── use{FeatureHook}.ts
├── graphql/
│   ├── queries/
│   └── mutations/
├── types/
│   └── Settings{Feature}Type.ts
└── constants/
    └── {CONSTANT}.ts
```

---

## Step 1: Create the Content Component

This is the main component rendered on the settings page.

**File**: `modules/settings/{feature}/components/Settings{Feature}Content.tsx`

```typescript
import { useNavigate } from 'react-router-dom';
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

export const SettingsMyFeatureContent = () => {
  const navigate = useNavigate();

  return (
    <SubMenuTopBarContainer
      title="My Feature"
      links={[
        { children: 'Workspace', href: '/settings/workspace' },
        { children: 'My Feature' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title="Section Title"
            description="Explain what this section configures"
          />
          {/* Section content */}
        </Section>

        <Section>
          <H2Title
            title="Another Section"
            description="Another configuration area"
          />
          {/* More content */}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
```

**Component hierarchy:**
1. `SubMenuTopBarContainer` — provides the page title and breadcrumb links
2. `SettingsPageContainer` — standard settings page wrapper with spacing
3. `Section` — groups related controls (from `twenty-ui/layout`)
4. `H2Title` — section heading with title and description (from `twenty-ui/display`)

---

## Step 2: Create Section Components (if complex)

Break large sections into their own components:

**File**: `modules/settings/{feature}/components/Settings{Feature}ConfigSection.tsx`

```typescript
import { Section } from 'twenty-ui/layout';
import { H2Title } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';

type SettingsMyFeatureConfigSectionProps = {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
};

export const SettingsMyFeatureConfigSection = ({
  isEnabled,
  onToggle,
}: SettingsMyFeatureConfigSectionProps) => {
  return (
    <Section>
      <H2Title
        title="Configuration"
        description="Enable or disable this feature"
      />
      <Toggle value={isEnabled} onChange={onToggle} />
    </Section>
  );
};
```

---

## Step 3: Create the Page Component

Pages live outside the modules directory, in `packages/twenty-front/src/pages/settings/`:

**File**: `packages/twenty-front/src/pages/settings/SettingsMyFeaturePage.tsx`

```typescript
import { SettingsMyFeatureContent } from '@/settings/my-feature/components/SettingsMyFeatureContent';

export const SettingsMyFeaturePage = () => {
  return <SettingsMyFeatureContent />;
};
```

The page component is intentionally thin — it just renders the content component.

---

## Step 4: Add the Route

In `packages/twenty-front/src/modules/app/hooks/useCreateAppRouter.tsx`:

1. Add the lazy import:

```typescript
const SettingsMyFeaturePage = lazy(() =>
  import('~/pages/settings/SettingsMyFeaturePage').then((module) => ({
    default: module.SettingsMyFeaturePage,
  })),
);
```

2. Add the `<Route>` inside the settings route group:

```typescript
<Route path="my-feature" element={<SettingsMyFeaturePage />} />
```

---

## Step 5: Add Navigation Entry

Settings navigation items are typically defined in the settings sidebar. Find the navigation configuration and add your item:

```typescript
{
  label: 'My Feature',
  path: '/settings/my-feature',
  Icon: IconMyFeature,  // Must exist in TablerIcons.ts (twenty-ui/display)
}
```

**Icon availability:** Only icons exported from `TablerIcons.ts` in `twenty-ui` are available. Check the file before using an icon name.

---

## Common UI Components

| Component | Import | Purpose |
|-----------|--------|---------|
| `Section` | `twenty-ui/layout` | Groups related content with spacing |
| `H2Title` | `twenty-ui/display` | Section heading with title + description |
| `Button` | `twenty-ui/input` | Action buttons |
| `Toggle` | `twenty-ui/input` | On/off switches |
| `TextInput` | `twenty-ui/input` | Text fields |
| `Select` | `twenty-ui/input` | Dropdown selects |
| `Card` | `twenty-ui/layout` | Card containers |
| `SettingsPageContainer` | `@/settings/components/SettingsPageContainer` | Standard settings page wrapper |
| `SubMenuTopBarContainer` | `@/ui/layout/page/components/SubMenuTopBarContainer` | Page title + breadcrumbs |

---

## Styling

Use theme CSS variables for spacing, not functions:

```typescript
// Correct
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

// WRONG — spacing is not a function
const StyledContainer = styled.div`
  padding: ${spacing(4)};  // Does not exist
`;
```

---

## Adding GraphQL Operations

If your settings page needs to read/write server data, follow the [graphql-operations skill](../graphql-operations/SKILL.md):

1. Define fragments/queries/mutations in `modules/settings/{feature}/graphql/`
2. Run codegen
3. Create hooks in `modules/settings/{feature}/hooks/`
4. Wire into components

---

## Checklist

- [ ] Content component uses `SubMenuTopBarContainer` → `SettingsPageContainer` → `Section` → `H2Title` hierarchy
- [ ] Page component is thin (just renders content component)
- [ ] Route added with lazy loading in `useCreateAppRouter.tsx`
- [ ] Navigation entry added to settings sidebar
- [ ] Icon exists in `TablerIcons.ts`
- [ ] Spacing uses `themeCssVariables.spacing[N]` (not a function call)
- [ ] `npx nx typecheck twenty-front` passes
- [ ] Customization tracking updated — see [customization-tracking skill](../customization-tracking/SKILL.md)
