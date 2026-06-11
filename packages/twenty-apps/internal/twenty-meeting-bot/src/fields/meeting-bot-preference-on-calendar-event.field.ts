import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

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
  label: 'Meeting Bot Preference',
  description:
    'Overrides whether the meeting bot is sent for this calendar event. When empty, participants auto-record settings decide.',
  icon: 'IconRobot',
  isNullable: true,
  options: [
    {
      id: MEETING_BOT_PREFERENCE_ON_OPTION_ID,
      value: RecallRecordingBotPreference.ON,
      label: 'On',
      position: 0,
      color: 'green',
    },
    {
      id: MEETING_BOT_PREFERENCE_OFF_OPTION_ID,
      value: RecallRecordingBotPreference.OFF,
      label: 'Off',
      position: 1,
      color: 'gray',
    },
  ],
});
