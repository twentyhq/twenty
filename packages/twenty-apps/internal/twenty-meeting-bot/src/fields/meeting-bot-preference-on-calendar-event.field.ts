import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MeetingBotPreference } from 'src/constants/meeting-bot-preference';
import { MEETING_BOT_PREFERENCE_OFF_OPTION_ID } from 'src/constants/meeting-bot-preference-off-option-id';
import { MEETING_BOT_PREFERENCE_ON_OPTION_ID } from 'src/constants/meeting-bot-preference-on-option-id';
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
    'Meeting bot recording is on by default when the app is installed. Turn it off for this event when needed.',
  icon: 'IconRobot',
  isNullable: false,
  defaultValue: `'${MeetingBotPreference.ON}'`,
  options: [
    {
      id: MEETING_BOT_PREFERENCE_ON_OPTION_ID,
      value: MeetingBotPreference.ON,
      label: 'On',
      position: 0,
      color: 'green',
    },
    {
      id: MEETING_BOT_PREFERENCE_OFF_OPTION_ID,
      value: MeetingBotPreference.OFF,
      label: 'Off',
      position: 1,
      color: 'red',
    },
  ],
});
