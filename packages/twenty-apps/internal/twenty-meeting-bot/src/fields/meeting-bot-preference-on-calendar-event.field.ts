import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MeetingBotPreference } from 'src/constants/meeting-bot-preference';
import { MEETING_BOT_PREFERENCE_AUTO_OPTION_ID } from 'src/constants/meeting-bot-preference-auto-option-id';
import { MEETING_BOT_PREFERENCE_OFF_OPTION_ID } from 'src/constants/meeting-bot-preference-off-option-id';
import { MEETING_BOT_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/meeting-bot-preference-on-calendar-event-field-universal-identifier';

export default defineField({
  universalIdentifier:
    MEETING_BOT_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  type: FieldType.SELECT,
  name: 'meetingBotPreference',
  label: 'Recording Bot',
  description:
    'Recording is enabled by default when the meeting bot app is installed. Disable it for this event when needed.',
  icon: 'IconRobot',
  isNullable: false,
  defaultValue: `'${MeetingBotPreference.AUTO}'`,
  options: [
    {
      id: MEETING_BOT_PREFERENCE_AUTO_OPTION_ID,
      value: MeetingBotPreference.AUTO,
      label: 'Record by default',
      position: 0,
      color: 'gray',
    },
    {
      id: MEETING_BOT_PREFERENCE_OFF_OPTION_ID,
      value: MeetingBotPreference.OFF,
      label: 'Do not record',
      position: 1,
      color: 'red',
    },
  ],
});
