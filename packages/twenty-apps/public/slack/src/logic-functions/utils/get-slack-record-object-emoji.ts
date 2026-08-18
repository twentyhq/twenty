import {
  SLACK_RECORD_OBJECT_EMOJI,
  SLACK_RECORD_OBJECT_FALLBACK_EMOJI,
} from 'src/logic-functions/constants/slack-record-object-emoji';

export const getSlackRecordObjectEmoji = (
  objectNameSingular: string,
): string =>
  SLACK_RECORD_OBJECT_EMOJI[objectNameSingular] ??
  SLACK_RECORD_OBJECT_FALLBACK_EMOJI;
