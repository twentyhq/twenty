import { CALL_RECORDER_RECORDING_NOTICE_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-recording-notice-enabled-env-var-name';
import { CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH } from 'src/logic-functions/constants/call-recorder-recording-notice-max-length';
import { CALL_RECORDER_RECORDING_NOTICE_MESSAGE_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-recording-notice-message-env-var-name';
import { DEFAULT_CALL_RECORDER_RECORDING_NOTICE_ENABLED } from 'src/logic-functions/constants/default-call-recorder-recording-notice-enabled';
import { DEFAULT_CALL_RECORDER_RECORDING_NOTICE_MESSAGE } from 'src/logic-functions/constants/default-call-recorder-recording-notice-message';
import { SUPPORTED_MEETING_PLATFORM_URL_PATTERNS_BY_PLATFORM } from 'src/logic-functions/constants/supported-meeting-platform-url-patterns';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { getBooleanApplicationVariableValue } from 'src/logic-functions/utils/get-boolean-application-variable-value.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const RECALL_CHAT_SUPPORTED_MEETING_URL_PATTERNS = [
  SUPPORTED_MEETING_PLATFORM_URL_PATTERNS_BY_PLATFORM.zoom,
  SUPPORTED_MEETING_PLATFORM_URL_PATTERNS_BY_PLATFORM.googleMeet,
  SUPPORTED_MEETING_PLATFORM_URL_PATTERNS_BY_PLATFORM.microsoftTeams,
];

type RecallBotChatConfig = {
  on_bot_join: {
    send_to: 'everyone';
    message: string;
  };
};

export const getRecallBotChatConfig = ({
  meetingUrl,
}: {
  meetingUrl: string;
}): RecallBotChatConfig | undefined => {
  if (
    !isRecordingNoticeEnabled() ||
    !RECALL_CHAT_SUPPORTED_MEETING_URL_PATTERNS.some((pattern) =>
      pattern.test(meetingUrl),
    )
  ) {
    return undefined;
  }

  const message = getRecordingNoticeMessage();

  return {
    on_bot_join: {
      send_to: 'everyone',
      message,
    },
  };
};

const isRecordingNoticeEnabled = (): boolean =>
  getBooleanApplicationVariableValue({
    applicationVariableName:
      CALL_RECORDER_RECORDING_NOTICE_ENABLED_ENV_VAR_NAME,
    defaultValue: DEFAULT_CALL_RECORDER_RECORDING_NOTICE_ENABLED,
  });

const getRecordingNoticeMessage = (): string => {
  const configuredMessage = getApplicationVariableValue(
    CALL_RECORDER_RECORDING_NOTICE_MESSAGE_ENV_VAR_NAME,
  )?.trim();
  const message = isNonEmptyString(configuredMessage)
    ? configuredMessage
    : DEFAULT_CALL_RECORDER_RECORDING_NOTICE_MESSAGE;

  return Array.from(message)
    .slice(0, CALL_RECORDER_RECORDING_NOTICE_MAX_LENGTH)
    .join('');
};
