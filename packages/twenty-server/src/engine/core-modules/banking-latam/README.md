# Banking LATAM

LATAM-specific bank integration with multi-bank connections (PSE/SPEI/ACH/SWIFT), transaction import, auto-reconciliation, and payment file processing (BAI2/MT940).

## Entities
- `BankConnectionEntity` — bankName, bankCode, accountNumber, accountType, currency, country, status, network (PSE/SPEI/ACH/SWIFT), currentBalance, autoSync
- `BankTransactionEntity` — connectionId, externalId, type (credit/debit/transfer/fee), amount, counterpartyName, reference, reconciliationStatus (pending/matched/unmatched), matchedInvoiceId
- `BankReconciliationEntity` — connectionId, periodStart, periodEnd, reconciliation results

## Service Methods
- `BankingLatamService` — connects to LATAM banks, imports transactions, auto-matches transactions to invoices, generates reconciliation reports, processes payment files (BAI2/MT940/CSV)

## REST Endpoints
- Banking controller for bank webhook callbacks and file uploads

## Feature Flag
N/A (LATAM finance module)

## Dependencies
- Accounts Receivable module (for invoice matching)
