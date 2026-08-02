import { isUndefined } from '@sniptt/guards';

// Recall sub codes for meetings where nothing was captured: the bot was never
// admitted, the meeting never started, or no human participant ever joined.
// Anything else stays FAILED so real recording errors remain visible.
export const NOT_RECORDED_RECALL_SUB_CODES: readonly string[] = [
  'meeting_not_started',
  'timeout_exceeded_noone_joined',
  'timeout_exceeded_only_bots_detected_using_participant_names',
  'timeout_exceeded_only_bots_detected_using_participant_events',
  'timeout_exceeded_waiting_room',
  'call_ended_by_platform_waiting_room_timeout',
  'bot_kicked_from_waiting_room',
];

export const isNotRecordedRecallSubCode = (
  subCode: string | undefined,
): boolean =>
  !isUndefined(subCode) && NOT_RECORDED_RECALL_SUB_CODES.includes(subCode);
