# CCG Central -- Enterprise Frontend Documentation

## Overview

The CCG Central frontend extends Twenty CRM's React application with 20 settings pages for enterprise module configuration and management. The frontend is built with React 18, TypeScript, Linaria (zero-runtime CSS-in-JS), Lingui (i18n), Jotai (state management), and Vite.

---

## Settings Pages (Module Configuration)

All enterprise settings pages are located in:
```
packages/twenty-front/src/pages/settings/modules/components/
```

### Module Overview Page

**File**: `SettingsEnterpriseModules.tsx`

The main module marketplace page. Displays all 21 enterprise modules in a responsive card grid, organized by category. Each card shows:
- Module name and description
- Plan tier badge (starter/professional/enterprise)
- Active/inactive status
- Click navigates to module detail page

**Categories displayed**:
- Sales (Gamification, PRM)
- Marketing (Marketing Campaigns, Events & Webinars)
- Service (Helpdesk, Knowledge Base, Field Service)
- Finance (Accounts Receivable, Accounting, FinTech)
- Operations (Inventory, Project, Procurement, Trade & Import, Fleet, IT Assets)
- HR (HRM & Payroll, LMS)
- Legal (Contract Lifecycle)
- Communications (VoIP & Telephony)
- Commerce (E-Commerce)

### Individual Module Pages

| File | Module | Description |
|------|--------|-------------|
| `SettingsModuleDetail.tsx` | Generic Detail | Module detail/configuration template |
| `SettingsModuleVoIP.tsx` | VoIP & Telephony | Asterisk server configuration, SIP extensions, call queues |
| `SettingsModuleInventory.tsx` | Inventory | Warehouse setup, stock management, reorder rules |
| `SettingsModuleHelpdesk.tsx` | Helpdesk & Support | Ticket configuration, SLA rules, CSAT settings |
| `SettingsModuleBilling.tsx` | Billing | Subscription plans, payment methods, invoice history |
| `SettingsModuleAccounting.tsx` | Accounting | ERP connections, chart of accounts, tax rules |
| `SettingsModuleHRM.tsx` | HRM & Payroll | Employee management, payroll configuration, org chart |
| `SettingsModuleProjects.tsx` | Project Management | Project templates, task configuration, time tracking |
| `SettingsModuleFleet.tsx` | Fleet & Logistics | Vehicle registration, driver management, route config |
| `SettingsModuleECommerce.tsx` | E-Commerce | Store setup, product catalog, loyalty programs |
| `SettingsModulePRM.tsx` | Partner Management | Partner portal, deal registration, MDF settings |
| `SettingsModuleCLM.tsx` | Contract Lifecycle | Contract templates, approval workflows, e-signature |
| `SettingsModuleFSM.tsx` | Field Service | Work order templates, technician management, dispatch |
| `SettingsModuleLMS.tsx` | Learning Management | Course management, certification tracks, quiz builder |
| `SettingsModuleEvents.tsx` | Events & Webinars | Event creation, registration forms, QR check-in |
| `SettingsModuleProcurement.tsx` | Procurement | Purchase request workflows, vendor scorecards |
| `SettingsModuleMarketing.tsx` | Marketing | Campaign management, lead scoring configuration |
| `SettingsModuleAI.tsx` | AI Configuration | LLM provider settings, API keys, usage monitoring |
| `SettingsModuleFiscal.tsx` | Fiscal Compliance | Country-specific tax configuration, certificates |

---

## Component Patterns

### Layout Pattern

All settings pages follow a consistent pattern using `SubMenuTopBarContainer`:

```tsx
export const SettingsModuleXyz = () => {
  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Module Name`}
      links={[
        { children: t`Workspace`, href: getSettingsPath(SettingsPath.Workspace) },
        { children: t`Modules`, href: getSettingsPath(SettingsPath.EnterpriseModules) },
        { children: t`Module Name` },
      ]}
    >
      {/* Module content */}
    </SubMenuTopBarContainer>
  );
};
```

### Styling Pattern (Linaria)

All components use Linaria's `styled` API with theme CSS variables:

```tsx
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[4]};
`;
```

Key theme variables used:
- `themeCssVariables.spacing[N]` -- Spacing scale (1-8)
- `themeCssVariables.color.border` -- Border color
- `themeCssVariables.color.background` -- Background color
- `themeCssVariables.color.accent` -- Accent/primary color
- `themeCssVariables.color.font.secondary` -- Secondary text color

### Internationalization (Lingui)

All user-facing strings use Lingui macros:

```tsx
import { useLingui } from '@lingui/react/macro';

const { t } = useLingui();
// Usage: t`Enterprise Modules`
```

### Responsive Grid

Module cards use CSS Grid with auto-fill for responsive layouts:

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: ${themeCssVariables.spacing[4]};
```

### Status Badges

Color-coded badges indicate module status:
- Green (`#10b981`) -- Active
- Blue (`#3b82f6`) -- Professional plan
- Purple (`#8b5cf6`) -- Enterprise plan
- Gray (`#6b7280`) -- Inactive/unavailable

---

## GraphQL Integration

### Key GraphQL Operations

The frontend communicates with enterprise modules through GraphQL. Key operations:

**Module Management**:
- `provisionTenant` -- Initial workspace setup
- `activateModule` / `deactivateModule` -- Module lifecycle
- `getActiveModules` -- List active modules for current workspace
- `calculateMonthlyInvoice` -- Billing calculation

**VoIP (Asterisk)**:
- `registerAsteriskServer` -- Configure Asterisk connection
- `initiateCall` -- Click-to-call
- `getCallAnalytics` -- Call statistics

**Inventory**:
- `createWarehouse` -- Add warehouse
- `addStock` / `transferStock` -- Stock operations
- `getLowStockItems` -- Reorder alerts

**Support**:
- `createTicket` -- New support ticket
- `getTicketMetrics` -- Dashboard metrics

### Apollo Client Configuration

The frontend uses Apollo Client for GraphQL communication. Enterprise modules use the same Apollo setup as core Twenty -- no special configuration needed. The `@AuthWorkspace` decorator on the backend automatically resolves the workspace from the auth token.

---

## Navigation

Enterprise modules are accessed through the Settings navigation:

```
Settings
  -> Workspace
  -> Modules (SettingsEnterpriseModules)
    -> [Module Detail Pages]
  -> Billing (SettingsModuleBilling)
  -> AI Configuration (SettingsModuleAI)
  -> Fiscal Compliance (SettingsModuleFiscal)
```

### Routing

Module detail pages use a parameterized route:
```
/settings/modules/:moduleCode
```

Navigation uses `react-router-dom`:
```tsx
const navigate = useNavigate();
navigate(getSettingsPath(SettingsPath.EnterpriseModuleDetail).replace(':moduleCode', mod.code));
```

---

## Key Frontend Files

| File | Purpose |
|------|---------|
| `src/pages/settings/modules/components/SettingsEnterpriseModules.tsx` | Module marketplace overview |
| `src/pages/settings/modules/components/SettingsModuleDetail.tsx` | Generic module detail |
| `src/pages/settings/modules/components/SettingsModuleBilling.tsx` | Billing configuration |
| `src/pages/settings/modules/components/SettingsModuleAI.tsx` | AI provider configuration |
| `src/pages/settings/modules/components/SettingsModuleFiscal.tsx` | Fiscal compliance settings |
| `src/modules/apollo/utils/getTokenPair.ts` | Token management (modified) |
| `src/modules/app/components/AppRouterProviders.tsx` | Router setup (modified) |
| `src/modules/ui/theme/components/BaseThemeProvider.tsx` | Theme provider (modified) |
| `src/modules/ui/theme/hooks/useColorScheme.ts` | Color scheme hook (modified) |

---

## Development Notes

### Adding a New Settings Page

1. Create `SettingsModule<Name>.tsx` in `src/pages/settings/modules/components/`
2. Export a named component (no default exports per project convention)
3. Use `SubMenuTopBarContainer` for layout
4. Use Linaria `styled` for styling
5. Use Lingui `t` macro for all strings
6. Add the route in the settings router
7. Add the module card entry in `ENTERPRISE_MODULES` array in `SettingsEnterpriseModules.tsx`

### Code Conventions (from CLAUDE.md)

- Functional components only (no class components)
- Named exports only (no default exports)
- Types over interfaces
- No `any` type
- Props down, events up
- Components under 300 lines
- Import order: external, internal (`@/`), relative
- camelCase variables, PascalCase types, kebab-case files
