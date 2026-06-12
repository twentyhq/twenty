import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { MEETING_BOT_AUTO_RECORD_ENABLED_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/meeting-bot-auto-record-enabled-on-workspace-member-field-universal-identifier';

export default defineField({
  universalIdentifier:
    MEETING_BOT_AUTO_RECORD_ENABLED_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.BOOLEAN,
  name: 'meetingBotAutoRecordEnabled',
  label: 'Auto Record Meetings',
  description:
    'Automatically send the meeting bot to upcoming meetings with a conference link that this workspace member attends.',
  icon: 'IconRobot',
  defaultValue: false,
  isNullable: false,
});
