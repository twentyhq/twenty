# Field Service

Work order management with GPS-based technician dispatch, service contracts, predictive maintenance alerts, and field analytics.

## Entities
- `WorkOrderEntity` — title, status, type, priority, technicianId, address, lat/lng, scheduledStart/End, checklist, partsUsed, customerSignature, customerRating, firstTimeFix, laborCost, partsCost
- `TechnicianEntity` — employeeId, name, skills, currentLat/Lng, isAvailable, performanceScore, firstTimeFixRate, avgCustomerRating
- `ServiceContractEntity` — accountId, visitsIncluded, visitsUsed, responseTimeHours, autoRenew

## Service Methods
- `createWorkOrder(workspaceId, data)` — creates work order
- `autoDispatch(workspaceId, workOrderId)` — assigns nearest available technician by GPS + skill match
- `startWork(workOrderId)` — marks work in progress
- `completeWork(workOrderId, data)` — completes with signature, photos, parts; updates technician stats
- `updateTechnicianLocation(techId, lat, lng)` — GPS location update
- `getAvailableTechnicians(workspaceId, skill, location)` — sorted by distance/performance
- `createServiceReport(workOrderId, data)` — generates service report
- `getPredictiveMaintenanceAlerts(workspaceId)` — detects service interval patterns
- `getAnalytics(workspaceId)` — total orders, FTFR, avg rating, avg response time

## Feature Flag
`IS_MODULE_FIELD_SERVICE_ENABLED`

## Dependencies
- None
