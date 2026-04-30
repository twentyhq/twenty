# Incident Management

Incident lifecycle management with severity levels, timeline tracking, escalation workflows, postmortem generation, and SLA metrics (TTA/TTR).

## Entities
- `IncidentEntity` — title, severity (sev1-sev4), status (open/investigating/identified/mitigating/resolved/closed), assigneeId, service, component, affectedAccounts, slackChannel, statusPageUrl, timeToAcknowledgeMinutes, timeToResolveMinutes, rootCause, resolution
- `IncidentTimelineEntity` — incidentId, entryType (status_change/note/escalation/notification/action), content, authorId, previousStatus, newStatus, isPublic
- `PostmortemEntity` — incidentId, title, summary, root cause analysis, action items

## Service Methods
- `IncidentManagementService` — creates incidents, tracks timeline entries, manages escalation levels (L1->L2->L3->Management->Executive), generates postmortems, calculates TTA/TTR metrics

## Feature Flag
N/A (operations module)

## Dependencies
- None
