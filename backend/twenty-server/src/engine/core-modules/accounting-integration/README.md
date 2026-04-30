# Accounting Integration

Full double-entry accounting with ERP sync (Siigo/Alegra/QuickBooks/Xero/SAP), chart of accounts, journal entries, financial statements, tax rules, revenue recognition, commissions, and period close.

## Entities
- `AccountingConnectionEntity` — provider, syncDirection, credentials, accountMapping, lastSyncAt
- `AccountingSyncLogEntity` — connectionId, entityType, direction, status, payload
- `TaxRuleEntity` — name, country, rate, taxType (IVA), isWithholding, withholdingRate
- `RevenueRecognitionEntity` — dealId, totalAmount, recognitionType, deferralMonths, recognized, deferred
- `SalesCommissionEntity` — repId, dealId, dealAmount, commissionRate, commissionAmount, period
- `ChartOfAccountEntity` — code, name, type (asset/liability/equity/revenue/expense), balance
- `JournalEntryEntity` — date, lines (accountCode/debit/credit), status (draft/posted/voided), period
- `AccountingPeriodEntity` — period, status (open/closed)

## Service Methods
- `createConnection(workspaceId, data)` — connects to accounting system
- `syncInvoiceToAccounting(workspaceId, connectionId, data)` — syncs invoice to ERP
- `calculateTax(workspaceId, amount, country)` — returns tax + withholding
- `createRevenueSchedule(workspaceId, dealId, amount, type)` — deferred/immediate recognition
- `processMonthlyRecognition(workspaceId)` — processes monthly revenue recognition
- `calculateCommission(workspaceId, repId, dealId, amount, rate)` — calculates sales commission
- `createJournalEntry(workspaceId, data)` — balanced double-entry journal
- `getTrialBalance(workspaceId, asOfDate)` — trial balance report
- `getProfitAndLoss(workspaceId, startDate, endDate)` — P&L statement
- `getBalanceSheet(workspaceId, asOfDate)` — balance sheet
- `closePeriod(workspaceId, period)` — closes period with closing entries
- `threeWayMatch(workspaceId, poId, invoiceId, receiptId)` — PO/invoice/receipt matching

## Feature Flag
`IS_MODULE_ACCOUNTING_ENABLED`

## Dependencies
- None
