# FinTech Layer

Embedded payments (Stripe/PayU/Wompi/MercadoPago), electronic invoicing (DIAN/SAT/SRI), partner channel management, and revenue reconciliation.

## Entities
- `EmbeddedPaymentEntity` — quoteId, dealId, gateway, paymentLink, amount, currency, status, externalPaymentId
- `ElectronicInvoiceEntity` — invoiceId, provider (dian_co/sat_mx/sri_ec), cufe, status, xmlContent, pdfUrl
- `PartnerChannelEntity` — name, type (reseller), commissionRate, totalRevenue, totalCommissionPaid
- `RevenueReconciliationEntity` — paymentId, dealId, invoiceId, amount, status, source

## Service Methods
- `createPaymentLink(workspaceId, quoteId, dealId, amount, gateway)` — generates payment link
- `markPaymentCompleted(paymentId, externalPaymentId)` — marks payment as completed
- `submitElectronicInvoice(workspaceId, invoiceId, provider, xml)` — submits e-invoice to tax authority
- `markInvoiceAccepted(eInvoiceId, cufe, pdfUrl)` — records acceptance
- `markInvoiceRejected(eInvoiceId, reason)` — records rejection
- `createPartner(workspaceId, data)` — creates partner channel
- `recordPartnerDeal(partnerId, dealAmount)` — records partner deal + commission
- `reconcilePayment(workspaceId, paymentId, dealId, invoiceId, amount, source)` — matches payment to deal
- `getUnreconciledPayments(workspaceId)` — unmatched payments

## Feature Flag
`IS_MODULE_FINTECH_ENABLED`

## Dependencies
- Accounts Receivable module (required)
