# SaaS Platform

Multi-tenant platform management with plan-based module activation, usage tracking, billing calculation, LATAM fiscal connectors (DIAN/SAT/DGII/SII), cross-module event bus, and admin dashboard.

## Entities
- `TenantConfigEntity` — companyName, country, plan (starter/professional/enterprise), billingCycle, status, currency, limits, usage, stripeCustomerId
- `TenantModuleEntity` — moduleCode, isActive, billingType (flat/per_user/per_employee/usage), priceUSD
- `ModuleCatalogEntity` — code, name, category, pricing, requiredModules, countryAvailability
- `FiscalConfigEntity` — country, provider, testMode, certificatePath, taxRules, invoicePrefix, resolutionNumber
- `EventLogEntity` — eventType, sourceModule, targetModule, payload, status, retryCount

## Service Methods
- `provisionTenant(workspaceId, data)` — provisions tenant with plan, fiscal, modules
- `updatePlan(workspaceId, newPlan)` — upgrades/downgrades plan
- `activateModule(workspaceId, moduleCode)` — activates module with dependency check
- `deactivateModule(workspaceId, moduleCode)` — deactivates with reverse dependency check
- `checkModuleAccess(workspaceId, moduleCode)` — middleware guard for module access
- `trackUsage(workspaceId, metric, increment)` — usage tracking with limit enforcement
- `calculateMonthlyInvoice(workspaceId)` — per-module billing with country tax
- `setupFiscalConnector(workspaceId, country)` — LATAM e-invoicing setup
- `getNextInvoiceNumber(workspaceId, country)` — country-specific invoice numbering
- `emitEvent(workspaceId, eventType, source, payload)` — cross-module event emission
- `processEvents(workspaceId)` — routes events to target modules
- `seedModuleCatalog()` — seeds 21 module catalog entries
- `getAdminDashboard()` — tenants, MRR, by country/plan, module adoption

## REST Endpoints
- SaaS platform controller for admin/billing operations

## Feature Flag
N/A (core platform module, always active)

## Dependencies
- None (all other modules depend on this)
