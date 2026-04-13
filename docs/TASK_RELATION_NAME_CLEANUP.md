# Task: Relation Name Cleanup (accounttags vs accountTags)

**Created:** 2026-04-10  
**Status:** COMPLETE — 2026-04-13

## Problem

The `diff-environments.py` script reported apparent gaps between UAT and production
for several relation fields, but they were actually **naming inconsistencies** between
environments — the same relation existed under different names in each environment.

## Completed fixes

| Object | UAT (old) | Production | Action taken |
|---|---|---|---|
| `tag` | `accounttags` | `accountTags` | Renamed in UAT via API |
| `tag` | `persontags` | `personTags` | Renamed in UAT via API |
| `company` | `accounttags` | `accountTags` | Renamed in UAT via API |
| `person` | `persontags` | `personTags` | Renamed in UAT via API |
| `quoteSection` | `quoteTerm` | `quoteTerms` | Renamed in UAT via API (migration 013) |
| `quote` | `sections` | `quoteSections` | Renamed in UAT via API (migration 013) |
| `quote` | missing | `quoteSections` + `quoteSection.quote` | Recreated pair (migration 013) |
| `quote` | missing | `account` → company | Created in UAT (migration 013) |
| Various | extra UAT fields | not in prod | Deleted: quoteSection.withinQuote, quote.quoteTerm, quoteTerm.owningSectionQuotationQuote, accountGroup.quoteSections |

## Result

After running migration `013-quote-structure-align.py` against UAT, the
quote/quoteSection/quoteTerm/lineItem/accountGroup relation structure is
**identical between UAT and production**.

## Remaining EXTRA fields in production (not yet in UAT)

These exist in production but were not part of the relation naming task —
they are genuine feature gaps that need separate work:

- `riskFormCompleted` on opportunity
- `targetAccounttag` morph relations on attachment/noteTarget/taskTarget/timelineActivity
- `company.quotes` (back-reference) — now fixed as part of migration 013
- `favorite.accounttag` / `favorite.persontag` — investigate separately
