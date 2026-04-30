# Sales Execution

Territory management, quota tracking, and deal blueprints for structured sales processes.

## Entities
- `SalesTerritoryEntity` — name, description, regions, industries, assignees, quota
- `SalesQuotaEntity` — userId, period, targetAmount, achievedAmount, status (on_track/at_risk/behind/achieved)
- `SalesDealBlueprintEntity` — name, isActive, stageRules (required fields per stage, allowed transitions)

## Service Methods
- `createTerritory(workspaceId, data)` — creates sales territory
- `setTerritoryAssignees(territoryId, assignees)` — assigns reps to territory
- `updateTerritoryQuota(territoryId, quota)` — sets territory quota
- `getTerritorySummary(workspaceId)` — territory count, total quota, regions, industries
- `assignQuota(workspaceId, userId, period, amount)` — assigns individual quota
- `updateProgress(quotaId, achieved)` — updates quota progress with auto-status
- `getQuotaStatus(workspaceId, userId, period)` — individual quota status
- `getQuotaOverview(workspaceId, period)` — team quota achievement summary

## Feature Flag
N/A (core sales module)

## Dependencies
- None
