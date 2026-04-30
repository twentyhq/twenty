# Procurement

Purchase request workflow with RFQ management, vendor scorecards, three-way matching, duplicate spend detection, and spend analytics.

## Entities
- `PurchaseRequestEntity` — requesterId, title, justification, status, category, estimatedAmount, items, approverId
- `RFQEntity` — purchaseRequestId, supplierIds, deadline, responses (price/leadTime/terms), selectedSupplierId
- `VendorScorecardEntity` — supplierId, period, onTimeDeliveryRate, qualityScore, priceComplianceRate, overallScore

## Service Methods
- `createPR(workspaceId, data)` — creates purchase request with auto-calculated total
- `approvePR(prId, approverId)` — approves purchase request
- `createRFQ(workspaceId, prId, supplierIds, deadline)` — creates request for quotation
- `submitRFQResponse(rfqId, supplierId, price, leadTime, terms)` — records supplier response
- `compareRFQResponses(rfqId)` — scores responses (60% price, 40% lead time)
- `selectSupplier(rfqId, supplierId)` — awards RFQ to supplier
- `updateVendorScorecard(workspaceId, supplierId, period, metrics)` — updates vendor score
- `getSpendByCategory(workspaceId)` — spend breakdown by category
- `threeWayMatch(workspaceId, prId, invoiceAmount, receivedQty)` — PR/invoice/receipt matching
- `getTopSuppliers(workspaceId, period)` — ranked suppliers by spend + score
- `detectDuplicateSpend(workspaceId)` — finds duplicate purchases across requesters

## Feature Flag
`IS_MODULE_PROCUREMENT_ENABLED`

## Dependencies
- Inventory module (required)
