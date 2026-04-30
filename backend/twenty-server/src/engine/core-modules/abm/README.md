# Account-Based Marketing (ABM)

Target account management with tiered segmentation, key contact mapping, engagement tracking, and ABM campaign management.

## Entities
- `TargetAccountEntity` — companyId, companyName, tier (platinum/gold/silver), status, keyContacts, decisionMakers, engagementHistory, totalRevenue, opportunityCount
- `ABMCampaignEntity` — name, description, targetAccountIds, targetTier, isActive, enrolledCount, respondedCount

## Service Methods
- `TargetAccountService` — CRUD for target accounts, tier management, engagement tracking
- `ABMCampaignService` — creates campaigns targeting specific accounts/tiers, tracks enrollment and response rates

## Feature Flag
N/A (core marketing module)

## Dependencies
- None
