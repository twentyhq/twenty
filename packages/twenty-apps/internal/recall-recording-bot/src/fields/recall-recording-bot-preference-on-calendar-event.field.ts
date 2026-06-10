import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { RECALL_RECORDING_BOT_PREFERENCE_AUTO_OPTION_ID } from 'src/constants/recall-recording-bot-preference-auto-option-id';
import { RECALL_RECORDING_BOT_PREFERENCE_OFF_OPTION_ID } from 'src/constants/recall-recording-bot-preference-off-option-id';
import { RECALL_RECORDING_BOT_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/recall-recording-bot-preference-on-calendar-event-field-universal-identifier';
import { RECALL_RECORDING_BOT_PREFERENCE_ON_OPTION_ID } from 'src/constants/recall-recording-bot-preference-on-option-id';
import { type RecallRecordingBotPreference } from 'src/logic-functions/types/recall-recording-bot-preference.type';

export default defineField({
  universalIdentifier:
    RECALL_RECORDING_BOT_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  type: FieldType.SELECT,
  name: 'recallRecordingBotPreference',
  label: 'Recall Bot Preference',
  description:
    'Whether the Recall recording bot should be sent for this calendar event.',
  icon: 'IconRobot',
  defaultValue: "'AUTO'",
  isNullable: false,
  options: [
    {
      id: RECALL_RECORDING_BOT_PREFERENCE_AUTO_OPTION_ID,
      value: 'AUTO' satisfies RecallRecordingBotPreference,
      label: 'Auto',
      position: 0,
      color: 'blue',
    },
    {
      id: RECALL_RECORDING_BOT_PREFERENCE_ON_OPTION_ID,
      value: 'ON' satisfies RecallRecordingBotPreference,
      label: 'On',
      position: 1,
      color: 'green',
    },
    {
      id: RECALL_RECORDING_BOT_PREFERENCE_OFF_OPTION_ID,
      value: 'OFF' satisfies RecallRecordingBotPreference,
      label: 'Off',
      position: 2,
      color: 'gray',
    },
  ],
});
