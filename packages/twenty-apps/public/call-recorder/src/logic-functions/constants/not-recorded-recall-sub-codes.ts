// Recall sub_codes are an open set; anything not listed follows the normal status lifecycle.
export const NOT_RECORDED_RECALL_SUB_CODES: string[] = [
  // The bot was never let into the call.
  'timeout_exceeded_waiting_room',
  'call_ended_by_platform_waiting_room_timeout',
  'meeting_not_started',
  'google_meet_meeting_room_not_ready',
  // The bot joined, but nobody else ever joined.
  'timeout_exceeded_noone_joined',
];
