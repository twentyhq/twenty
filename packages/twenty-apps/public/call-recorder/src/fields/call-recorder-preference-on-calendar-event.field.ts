import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { CALL_RECORDER_PREFERENCE_OFF_OPTION_ID } from 'src/constants/call-recorder-preference-off-option-id';
import { CALL_RECORDER_PREFERENCE_ON_OPTION_ID } from 'src/constants/call-recorder-preference-on-option-id';
import { CALL_RECORDER_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    CALL_RECORDER_PREFERENCE_ON_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.calendarEvent.universalIdentifier,
  type: FieldType.SELECT,
  name: 'callRecorderPreference',
  label: 'Recording Bot',
  description:
    'Set to On by the app when it schedules the recorder for this meeting. Turn it off to skip this event.',
  icon: 'IconRobot',
  isNullable: true,
  options: [
    {
      id: CALL_RECORDER_PREFERENCE_ON_OPTION_ID,
      value: CallRecorderPreference.ON,
      label: 'On',
      position: 0,
      color: 'green',
    },
    {
      id: CALL_RECORDER_PREFERENCE_OFF_OPTION_ID,
      value: CallRecorderPreference.OFF,
      label: 'Off',
      position: 1,
      color: 'red',
    },
  ],
});
