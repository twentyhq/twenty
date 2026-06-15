import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MeetingBotPreference } from 'src/constants/meeting-bot-preference';
import {
  MEETING_BOT_PREFERENCE_AUTO_OPTION_ID,
  MEETING_BOT_PREFERENCE_OFF_OPTION_ID,
  MEETING_BOT_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  MEETING_BOT_PREFERENCE_ON_OPTION_ID,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    MEETING_BOT_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  type: FieldType.SELECT,
  name: 'meetingBotPreference',
  label: 'Recording Bot',
  description:
    'Whether the meeting bot records this event. Auto follows the auto-record settings of participating workspace members.',
  icon: 'IconRobot',
  isNullable: false,
  defaultValue: `'${MeetingBotPreference.AUTO}'`,
  options: [
    {
      id: MEETING_BOT_PREFERENCE_AUTO_OPTION_ID,
      value: MeetingBotPreference.AUTO,
      label: 'Auto',
      position: 0,
      color: 'gray',
    },
    {
      id: MEETING_BOT_PREFERENCE_ON_OPTION_ID,
      value: MeetingBotPreference.ON,
      label: 'Recording on',
      position: 1,
      color: 'green',
    },
    {
      id: MEETING_BOT_PREFERENCE_OFF_OPTION_ID,
      value: MeetingBotPreference.OFF,
      label: 'Recording off',
      position: 2,
      color: 'red',
    },
  ],
});
