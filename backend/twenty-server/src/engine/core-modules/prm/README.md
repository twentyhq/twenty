# Partner Relationship Management (PRM)

Full partner lifecycle with tiered programs, deal registration with conflict detection, MDF management, SPIFF commissions, gamification, and channel analytics.

## Entities
- `PartnerEntity` — companyName, tier (platinum/gold/silver/bronze), status, commissionRate, healthScore, totalRevenue, badges, points, onboardingChecklist
- `DealRegistrationEntity` — partnerId, prospectCompanyName, estimatedValue, status, exclusivityDays, conflictingPartnerId
- `MDFRequestEntity` — partnerId, title, amountRequested, amountApproved, amountSpent, leadsGenerated, revenueGenerated
- `PartnerSPIFFEntity` — partnerId, dealId, dealAmount, spiffRate, spiffAmount, paymentStatus
- `PartnerCommunicationEntity` — title, body, type, targetTiers, readCount

## Service Methods
- `recruitPartner(workspaceId, data)` — adds prospect partner
- `onboardPartner(partnerId)` — generates onboarding checklist
- `activatePartner(partnerId, tier)` — activates with tier-based commission (Platinum=20%, Gold=15%, Silver=10%)
- `registerDeal(workspaceId, partnerId, data)` — registers deal with conflict detection
- `wonDealRegistration(regId, dealId, amount)` — records won deal, calculates SPIFF
- `requestMDF(workspaceId, partnerId, data)` — requests marketing development funds
- `reconcileMDF(mdfId, spent, leads, revenue)` — reconciles MDF spend vs results
- `calculateHealthScore(partnerId)` — scores partner health (deals, revenue, training, engagement)
- `evaluateTierUpgrade(workspaceId)` — suggests tier upgrades based on performance
- `getChannelAnalytics(workspaceId)` — channel revenue, MDF ROI, top partners, by tier
- `getPartnerLeaderboard(workspaceId)` — gamified partner ranking

## Feature Flag
`IS_MODULE_PRM_ENABLED`

## Dependencies
- None
