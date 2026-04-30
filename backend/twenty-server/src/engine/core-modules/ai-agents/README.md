# AI Agents

Autonomous AI agents for sales, customer success, and operations workflows.

## Agents
- **SDR Agent** — automated outbound prospecting, lead qualification, and initial outreach
- **CSM Agent** — customer success monitoring, health alerts, and proactive engagement
- **Data Hygiene Agent** — detects and fixes data quality issues (duplicates, stale records)
- **Deal Qualification Agent** — scores and qualifies deals based on BANT/MEDDIC criteria
- **Meeting Notes Agent** — generates meeting summaries, action items, and follow-ups
- **Prospecting Research Agent** — researches prospects and companies for sales prep
- **Competitive Intelligence Agent** — tracks competitor mentions and positioning
- **Contract Intelligence Agent** — analyzes contract terms and flags risks

## Entities (per agent subdirectory)
- `SdrAgentEntity` — SDR agent configuration and state
- `CsmAgentEntity` — CSM agent configuration and state
- `DataHygieneAgentEntity` — data quality rules and results
- `DealQualificationAgentEntity` — qualification criteria and scores
- `MeetingNotesAgentEntity` — meeting recordings and summaries
- `ProspectingResearchAgentEntity` — research tasks and findings
- `CompetitiveIntelligenceAgentEntity` — competitor tracking data
- `ContractIntelligenceAgentEntity` — contract analysis results

## Services (per agent subdirectory)
Each agent has a dedicated service handling its lifecycle, execution, and results.

## Feature Flag
N/A (AI infrastructure module)

## Dependencies
- AI Governance module (for LLM calls)
- AI/ML module
