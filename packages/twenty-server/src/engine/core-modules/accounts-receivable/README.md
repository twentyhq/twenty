# Accounts Receivable

Full-cycle invoice-to-cash management with dunning, disputes, customer portal, and AI-powered collection scoring.

## Entities
- `InvoiceEntity` — invoiceNumber, status, totalAmount, balanceDue, currency, dueDate, lineItems, lateFeeRate, isRecurring
- `PaymentEntity` — invoiceId, amount, method (bank_transfer/stripe/payu/wompi/pse), matchStatus, matchConfidence
- `DisputeEntity` — invoiceId, status, reason, disputedAmount, slaHours, resolution
- `DunningSequenceEntity` — name, segment, steps (dayOffset/channel/tone), pauseOnDispute
- `PaymentPromiseEntity` — invoiceId, promisedDate, promisedAmount, kept, broken
- `PortalAccessEntity` — accountId, contactEmail, accessToken, expiresAt
- `AutopayEntity` — accountId, paymentMethod, stripeCustomerId, maxAmount
- `EarlyPaymentDiscountEntity` — daysBeforeDue, discountPercent
- `CollectionScoreEntity` — accountId, riskScore, paymentProbability, segment, callPriority

## Service Methods
- `createInvoiceFromDeal(workspaceId, data)` — generates invoice from deal line items
- `applyPayment(workspaceId, invoiceId, amount, method)` — records payment, updates balance
- `autoMatchPayments(workspaceId, bankEntries)` — matches bank entries to open invoices
- `applyLateFees(workspaceId)` — calculates and applies late fees on overdue invoices
- `markOverdueInvoices(workspaceId)` — bulk-marks overdue invoices
- `openDispute(workspaceId, invoiceId, data)` — opens invoice dispute
- `getDunningActions(workspaceId)` — returns pending dunning actions
- `getDSO(workspaceId)` — calculates Days Sales Outstanding
- `getAgingReport(workspaceId)` — aging buckets (current, 1-30, 31-60, 61-90, 90+)
- `getCashForecast(workspaceId, days)` — expected cash by date
- `calculateCollectionScore(workspaceId, accountId)` — AI risk scoring per account
- `getDailyCallList(workspaceId)` — prioritized collection call list
- `generatePortalAccess(workspaceId, accountId, email)` — creates customer portal token
- `processAutopay(workspaceId)` — charges autopay enrollments

## GraphQL API
### Queries
- `arMetrics` — DSO, CEI, aging buckets
- `cashForecast(days)` — expected cash inflow

### Mutations
- `createInvoiceFromDeal(input)` — creates invoice
- `sendInvoice(invoiceId)` — marks invoice sent
- `applyPayment(input)` — records payment
- `openDispute(input)` — opens dispute
- `markOverdueInvoices` — bulk overdue update
- `applyLateFees` — applies late fees

## REST Endpoints
- `GET /rest/ar/portal/:token` — customer portal: summary + invoices
- `POST /rest/ar/portal/:token/pay/:invoiceId` — initiate payment from portal
- `POST /rest/ar/portal/:token/dispute/:invoiceId` — open dispute from portal

## Feature Flag
`IS_MODULE_ACCOUNTS_RECEIVABLE_ENABLED`

## Dependencies
- None (standalone)
