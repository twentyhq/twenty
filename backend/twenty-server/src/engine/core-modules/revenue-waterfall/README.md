# Revenue Waterfall

SaaS revenue analytics with ARR waterfall (new/expansion/contraction/churn), booking entries, churn tracking, NRR/GRR calculation, and segment-based analysis.

## Entities
- `RevenueWaterfallEntity` — period, periodStart, periodEnd, openingARR, newBookings, expansionRevenue, contractionRevenue, churnedRevenue, closingARR, netRevenueRetention, grossRevenueRetention, totalAccounts, newAccounts, churnedAccounts
- `BookingEntryEntity` — accountId, dealId, type (new/renewal/expansion/contraction), amount, arrImpact, bookingDate, contractStart, contractEnd, segment (enterprise/mid_market/smb/startup), salesRepId
- `ChurnEntryEntity` — accountId, lostARR, reason (competitor/budget/product_fit/support/merger), churnDate

## Service Methods
- `RevenueWaterfallService` — records bookings and churn, calculates ARR waterfall periods, computes NRR/GRR, analyzes churn by reason and segment

## Feature Flag
N/A (core revenue module)

## Dependencies
- None
