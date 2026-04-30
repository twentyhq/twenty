# AI/ML Features

Suite of AI-powered CRM capabilities: predictive lead scoring, AI email writer, sentiment analysis, NLP queries, next-best-action, deal loss intelligence, meeting briefings, auto-enrichment, and ICP fit scoring.

## Entities
- `PredictiveLeadScoringEntity` — lead scoring model data
- `AIEmailWriterEntity` — AI-generated email drafts
- `SentimentAnalysisEntity` — text sentiment scoring
- `NLPQueryEntity` — natural language to CRM query
- `NextBestActionEntity` — recommended next actions for deals
- `DealLossIntelligenceEntity` — deal loss pattern analysis
- `MeetingBriefingEntity` — AI-generated meeting prep
- `AutoEnrichmentEntity` — automatic contact/company enrichment
- `ICPFitEntity` — ideal customer profile fit scoring

## Services
- `PredictiveLeadScoringService` — scores leads based on behavioral + firmographic signals
- `AIEmailWriterService` — generates personalized email drafts
- `SentimentAnalysisService` — analyzes text sentiment
- `NLPQueryService` — converts natural language to CRM queries
- `NextBestActionService` — recommends next sales actions
- `DealLossIntelligenceService` — analyzes why deals are lost
- `MeetingBriefingService` — generates pre-meeting intelligence
- `AutoEnrichmentService` — enriches contact/company data
- `ICPFitService` — scores accounts against ideal customer profile

## Feature Flag
N/A (AI infrastructure module)

## Dependencies
- AI Governance module (for LLM calls)
