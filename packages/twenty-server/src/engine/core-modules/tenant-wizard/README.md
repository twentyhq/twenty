# Tenant Wizard

Guided onboarding wizard with step-by-step tenant setup, industry templates, progress tracking, and validation rules.

## Entities
- `WizardStepEntity` — name, description, order, category, status (pending/in_progress/completed/skipped/failed), isRequired, componentKey, config, validationRules, dependsOn, estimatedMinutes
- `WizardProgressEntity` — userId, currentStepOrder, totalSteps, completedSteps, progressPercent, isCompleted, stepResults, selectedIndustry, selectedTemplate, estimatedTeamSize
- `IndustryTemplateEntity` — name, industry (technology/finance/healthcare/retail/manufacturing/services/education), modules, customFields, pipelines, dashboards, automations

## Service Methods
- `TenantWizardService` — generates wizard steps per industry, tracks progress, applies industry templates (modules + custom fields + pipelines + dashboards), validates step completion with dependency checks

## Feature Flag
N/A (core onboarding module)

## Dependencies
- SaaS Platform module (for module activation)
