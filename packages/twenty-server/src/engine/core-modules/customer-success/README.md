# Customer Success

Customer health scoring, NPS surveys, success playbooks, QBR scheduling, and expansion revenue tracking.

## Entities
- `CustomerHealthEntity` — accountId, healthScore, status (healthy/at_risk/critical/churned), metrics, riskFactors, recommendations
- `NPSSurveyEntity` — accountId, score, feedback, responded
- `CustomerSuccessPlaybookEntity` — accountId, name, status, steps, triggers, progress
- `QBRRecordEntity` — accountId, scheduledAt, attendees, actionItems, summary, status
- `ExpansionRevenueEntity` — accountId, amount, type (upsell/cross_sell/renewal), status (forecasted/committed/realized)

## Service Methods
- `computeHealth(workspaceId, accountId, metrics)` — scores health based on support tickets, login frequency, NPS, payment issues, renewal timeline
- `getHealth(workspaceId, accountId)` — retrieves health score
- `sendNPS(workspaceId, accountId)` — creates NPS survey
- `recordNPS(id, score, feedback)` — records NPS response
- `createPlaybook(workspaceId, data)` — creates success playbook
- `completePlaybook(id)` — marks playbook complete
- `scheduleQBR(workspaceId, accountId, scheduledAt, attendees)` — schedules QBR
- `completeQBR(id, summary, actionItems)` — completes QBR with summary
- `trackExpansionRevenue(workspaceId, accountId, amount, type)` — tracks expansion revenue
- `getExpansionRevenueSummary(workspaceId, accountId)` — expansion by type and status
- `getCustomerSuccessSummary(workspaceId, accountId)` — unified account health view

## Feature Flag
N/A (core CS module)

## Dependencies
- None
