// Recall end-of-call sub_codes meaning no human ever attended the meeting.
// Recall treats sub_codes as an open set, so anything not listed here keeps
// the regular FAILED classification.
export const NOT_ATTENDED_RECALL_SUB_CODES: string[] = [
  // The bot was never let into the call.
  'timeout_exceeded_waiting_room',
  'call_ended_by_platform_waiting_room_timeout',
  'meeting_not_started',
  'google_meet_meeting_room_not_ready',
  // The bot was in the call alone, or only with other bots.
  'timeout_exceeded_noone_joined',
  'timeout_exceeded_silence_detected',
  'timeout_exceeded_only_bots_detected_using_participant_names',
  'timeout_exceeded_only_bots_detected_using_participant_events',
];
