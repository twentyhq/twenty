// Recall joins on time for any bot booked more than 10 minutes ahead, so booking far out
// only adds bots to update or cancel when a workspace changes its settings.
// Two days puts each meeting in two daily sweeps before it starts.
export const UPCOMING_CALENDAR_EVENT_SCHEDULING_HORIZON_DAYS = 2;
