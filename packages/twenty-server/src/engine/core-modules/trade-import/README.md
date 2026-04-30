# Trade & Import

International trade management with purchase orders, shipment tracking, customs clearance, landed cost calculation, OCR document processing, and carbon footprint tracking.

## Entities
- `PurchaseOrderEntity` — poNumber, supplierId, status, incoterm (FOB/CIF/DDP/EXW), lineItems (with hsCode), originCountry, destinationCountry
- `ShipmentEntity` — purchaseOrderId, status, carrier, trackingNumber, blNumber, containerNumber, etd, eta, freightCost, carbonKg
- `CustomsEntryEntity` — shipmentId, dutyAmount, vatAmount, antidumpingDuty, ftaApplied, ftaSavingsPercent, documentChecklist, restrictedPartyCleared
- `LandedCostEntity` — purchaseOrderId, productId, productValue, freight, insurance, duties, vat, totalLandedCost, unitLandedCost

## Service Methods
- `createPO(workspaceId, data)` — creates purchase order with auto-numbered PO
- `approvePO(poId, approverId)` — approves PO
- `createShipment(workspaceId, data)` — creates shipment, updates PO status
- `updateShipmentStatus(shipmentId, status)` — updates shipment status
- `getDelayedShipments(workspaceId)` — finds shipments past ETA
- `createCustomsEntry(workspaceId, data)` — creates customs entry
- `applyFTA(customsEntryId, ftaName, savingsPercent)` — applies free trade agreement
- `calculateLandedCost(workspaceId, poId, productId, data)` — full landed cost breakdown
- `processDocumentOCR(workspaceId, shipmentId, docType, content)` — extracts fields from trade docs
- `calculateCarbonFootprint(shipmentId)` — CO2 emissions by transport mode
- `getCarbonReport(workspaceId)` — total emissions by route
- `getTradeAnalytics(workspaceId)` — POs, transit days, landed costs, duties

## Feature Flag
`IS_MODULE_TRADE_IMPORT_ENABLED`

## Dependencies
- Inventory module (required)
