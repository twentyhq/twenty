import { defineLogicFunction } from 'twenty-sdk/define';

import {
  CALL_RECORDING_MEETING_CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  SHOW_CALL_RECORDING_MEETING_CARD_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type CallRecordingMeetingCardInput } from 'src/logic-functions/types/call-recording-meeting-card-input.type';

export const showCallRecordingMeetingCardHandler = async (
  input: CallRecordingMeetingCardInput,
): Promise<CallRecordingMeetingCardInput> => input;

export default defineLogicFunction({
  universalIdentifier:
    SHOW_CALL_RECORDING_MEETING_CARD_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'show-call-recording-meeting-card',
  description:
    'Shows the meeting of a call recording as a card in the chat, with its title, time and attendees as the reader is allowed to see them.',
  timeoutSeconds: 10,
  handler: showCallRecordingMeetingCardHandler,
  toolTriggerSettings: {
    frontComponentUniversalIdentifier:
      CALL_RECORDING_MEETING_CARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  },
});
