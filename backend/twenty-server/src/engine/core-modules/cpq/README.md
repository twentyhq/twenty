# Configure, Price, Quote (CPQ)

Price book management, product pricing with tiered/volume models, quote generation with line items, and tax calculation.

## Entities
- `PriceBookEntity` — name, isActive, effectiveFrom, effectiveTo
- `ProductPricingEntity` — priceBookId, productId, unitPrice, cost, pricingModel (fixed/volume/tiered), pricingTiers
- `QuoteEntity` — opportunityId, name, totalAmount, subtotal, discount, tax, status (draft/finalized), validUntil
- `QuoteLineItemEntity` — quoteId, productId, quantity, unitPrice, discountRate, discountAmount, taxRate (19% default), taxAmount, lineTotal

## Service Methods
- `createPriceBook(workspaceId, name)` — creates price book
- `setProductPricing(priceBookId, productId, unitPrice)` — sets product price
- `createQuote(workspaceId, opportunityId, name)` — creates draft quote
- `addLineItem(quoteId, productId, quantity, unitPrice, options)` — adds line with discount/tax calculation
- `removeLineItem(quoteId, lineItemId)` — removes line item
- `calculateQuote(quoteId)` — recalculates quote totals
- `finalizeQuote(quoteId)` — marks quote as finalized
- `getLineItems(quoteId)` — lists quote line items

## Feature Flag
N/A (core sales module)

## Dependencies
- None
