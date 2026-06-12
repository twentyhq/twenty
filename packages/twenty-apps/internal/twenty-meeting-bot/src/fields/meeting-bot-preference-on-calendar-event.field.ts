import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MEETING_BOT_PREFERENCE_AUTO_OPTION_ID } from 'src/constants/meeting-bot-preference-auto-option-id';
import { MEETING_BOT_PREFERENCE_OFF_OPTION_ID } from 'src/constants/meeting-bot-preference-off-option-id';
import { MEETING_BOT_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/meeting-bot-preference-on-calendar-event-field-universal-identifier';
import { MEETING_BOT_PREFERENCE_ON_OPTION_ID } from 'src/constants/meeting-bot-preference-on-option-id';
import { RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';

export default defineField({
  universalIdentifier:
    MEETING_BOT_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  type: FieldType.SELECT,
  name: 'meetingBotPreference',
  label: 'Recording',
  description:
    'Whether the meeting bot records this event. Auto follows the auto-record settings of participating workspace members.',
  icon: 'IconRobot',
  isNullable: false,
  defaultValue: "'AUTO'",
  options: [
    {
      id: MEETING_BOT_PREFERENCE_AUTO_OPTION_ID,
      value: 'AUTO',
      label: 'Auto',
      position: 0,
      color: 'gray',
    },
    {
      id: MEETING_BOT_PREFERENCE_ON_OPTION_ID,
      value: RecallRecordingBotPreference.ON,
      label: 'Recording on',
      position: 1,
      color: 'green',
    },
    {
      id: MEETING_BOT_PREFERENCE_OFF_OPTION_ID,
      value: RecallRecordingBotPreference.OFF,
      label: 'Recording off',
      position: 2,
      color: 'red',
    },
  ],
});
