# Fleet & Logistics

Full fleet management with route optimization (TSP nearest-neighbor), real-time GPS tracking, proof of delivery, fuel anomaly detection, maintenance scheduling, and delivery cost analytics.

## Entities
- `FleetVehicleEntity` — plateNumber, make, model, status, capacityKg, odometerKm, fuelType, insuranceExpiry, soatExpiry, avgFuelConsumption, costPerKm
- `FleetDriverEntity` — employeeId, name, licenseNumber, assignedVehicleId, currentLat/Lng, currentSpeed, performanceScore, onTimeRate, fuelEfficiencyScore
- `FleetDeliveryEntity` — dealId, orderId, driverId, vehicleId, status, pickupAddress, deliveryAddress, distanceKm, proofOfDeliverySignature, proofPhotoIds, customerRating, fuelCost, laborCost, totalCost, items
- `FleetRouteEntity` — driverId, vehicleId, routeDate, stops, totalDistanceKm, completedStops
- `FuelLogEntity` — vehicleId, liters, cost, odometerKm, consumptionKmPerLiter, isAnomaly, anomalyType
- `MaintenanceOrderEntity` — vehicleId, type (preventive/corrective), title, cost, vendor, parts

## Service Methods
- `optimizeRoute(workspaceId, driverId, deliveryIds)` — TSP route optimization with time windows
- `createDelivery(workspaceId, data)` — creates delivery with tracking link
- `autoDispatch(workspaceId, deliveryId)` — assigns nearest driver with capacity check
- `completeDelivery(deliveryId, proof)` — records POD, calculates cost breakdown, updates driver stats
- `recordFuel(workspaceId, vehicleId, data)` — logs fuel with anomaly detection (high consumption, sudden drop, off-hours)
- `getMaintenanceDue(workspaceId)` — vehicles due by date or km
- `getFleetPositions(workspaceId)` — real-time GPS positions
- `getDeliveryTracking(deliveryId)` — live ETA with driver location
- `getCostPerDelivery(workspaceId)` — fuel/labor/depreciation breakdown
- `getCostByClient(workspaceId)` — delivery costs per account
- `getDriverPerformance(workspaceId)` — driver scorecard
- `getAnalytics(workspaceId)` — fleet-wide KPIs

## REST Endpoints
- Fleet controller for webhook/GPS integrations

## Feature Flag
`IS_MODULE_FLEET_ENABLED`

## Dependencies
- None
