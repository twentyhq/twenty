# IT Asset Management

Hardware/software asset lifecycle tracking with depreciation, license management, IT ticketing, and change requests.

## Entities
- `ITAssetEntity` — name, type (hardware/software/license/server), status, serialNumber, assignedToId, purchasePrice, depreciationMethod, currentValue, warrantyExpiry, assignmentHistory
- `SoftwareLicenseEntity` — name, vendor, totalSeats, usedSeats, annualCost, renewalDate, autoRenew
- `ITTicketEntity` — requesterId, assigneeId, assetId, type, status, subject
- `ChangeRequestEntity` — title, rollbackPlan, status, riskLevel, affectedAssetIds

## Service Methods
- `registerAsset(workspaceId, data)` — registers new IT asset
- `assignAsset(assetId, userId)` — assigns asset to user with history tracking
- `unassignAsset(assetId)` — returns asset to available pool
- `calculateDepreciation(assetId)` — straight-line depreciation calculation
- `getExpiringWarranties(workspaceId, withinDays)` — assets with expiring warranties
- `getMaintenanceDue(workspaceId)` — assets needing maintenance
- `disposeAsset(assetId)` — marks asset as disposed
- `registerLicense(workspaceId, data)` — registers software license
- `getLicenseUtilization(workspaceId)` — seat usage and waste per license
- `getSaaSSpend(workspaceId)` — total SaaS spend by vendor
- `createChangeRequest(workspaceId, data)` — creates change request
- `approveChange(changeId, approverId)` — approves change request

## GraphQL API
### Queries
- `calculateDepreciation(assetId)` — current depreciated value
- `getExpiringWarranties(withinDays)` — expiring warranty list
- `getLicenseUtilization` — license seat usage
- `getSaaSSpend` — total SaaS spend

### Mutations
- `registerAsset(input)` — registers asset
- `assignAsset(assetId, userId)` — assigns asset
- `createChangeRequest(input)` — creates change request

## Feature Flag
`IS_MODULE_IT_ASSETS_ENABLED`

## Dependencies
- None
