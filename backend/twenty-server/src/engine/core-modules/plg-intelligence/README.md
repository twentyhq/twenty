# PLG Intelligence

Product-led growth analytics with product usage tracking, PQL scoring, trial conversion optimization, and adoption stage tracking.

## Entities
- `ProductUsageEventEntity` — userId, featureName, action, category (feature/session/api/integration), count, durationMs, sessionId
- `PQLScoreEntity` — accountId, score, grade (hot/warm/cold), activeUsers, featuresBreadth, usageFrequency, depthScore, growthRate, topFeatures, signals
- `TrialConversionEntity` — accountId, planName, status (active/converted/expired), trialStartDate, trialEndDate, conversionProbability, featuresUsed, seatsUsed
- `ProductAdoptionEntity` — accountId, stage (onboarding/activating/adopting/expanding/churning), adoptionScore, activeUsers, dauWauRatio, featureAdoption, milestones, timeToValue

## Service Methods
- `PLGIntelligenceService` — tracks product usage events, calculates PQL scores based on usage signals, monitors trial conversion probability, tracks adoption stages and milestones

## Feature Flag
N/A (core analytics module)

## Dependencies
- None
