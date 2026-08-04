// Sub codes meaning nothing was captured: bot never admitted, meeting not started, nobody joined.
export const NOT_RECORDED_RECALL_SUB_CODES: readonly string[] = [
  'meeting_not_started',
  'timeout_exceeded_noone_joined',
  'timeout_exceeded_only_bots_detected_using_participant_names',
  'timeout_exceeded_only_bots_detected_using_participant_events',
  'timeout_exceeded_waiting_room',
  'call_ended_by_platform_waiting_room_timeout',
  'bot_kicked_from_waiting_room',
];
