// Recall recommends scheduling bots for a rolling near-term window rather than far in advance,
// so bots carry fresh config and volatile far-future meetings are not scheduled speculatively.
// 7 days matches Recall's "daily sync of the next 7 days" guidance for self-managed calendar integrations.
export const UPCOMING_CALENDAR_EVENT_SCHEDULING_HORIZON_DAYS = 7;
