import { defineObject, FieldType } from 'twenty-sdk/define';

import {
  SLACK_CHANNEL_RULE_CHANNEL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_CHANNEL_RULE_CHANNEL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_CHANNEL_RULE_MODE_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_CHANNEL_RULE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_CHANNEL_MODE } from 'src/logic-functions/constants/slack-channel-mode';

export default defineObject({
  universalIdentifier: SLACK_CHANNEL_RULE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'slackChannelRule',
  namePlural: 'slackChannelRules',
  labelSingular: 'Slack Channel Rule',
  labelPlural: 'Slack Channel Rules',
  description:
    'Scopes what the assistant may do in one Slack channel. Channels without a rule stay open, so the assistant works out of the box and only narrows where an admin asks for it.',
  icon: 'IconHash',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SLACK_CHANNEL_RULE_CHANNEL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier:
        SLACK_CHANNEL_RULE_CHANNEL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack channel ID',
      description: 'Channel this rule applies to, for example C0123456789',
      icon: 'IconHash',
      name: 'slackChannelId',
      isUnique: true,
    },
    {
      universalIdentifier:
        SLACK_CHANNEL_RULE_CHANNEL_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack channel name',
      description: 'Readable channel name, for reference only',
      icon: 'IconAbc',
      name: 'slackChannelName',
    },
    {
      universalIdentifier: SLACK_CHANNEL_RULE_MODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Mode',
      description: 'What the assistant is allowed to do in this channel',
      icon: 'IconLock',
      name: 'mode',
      defaultValue: `'${SLACK_CHANNEL_MODE.OPEN}'`,
      options: [
        {
          id: '35d404a0-34cc-42b8-9109-4135894be579',
          value: SLACK_CHANNEL_MODE.OPEN,
          label: 'Open',
          position: 0,
          color: 'green',
        },
        {
          id: 'eb33b26f-d53a-4d62-a292-618105a0b2b9',
          value: SLACK_CHANNEL_MODE.READ_ONLY,
          label: 'Read only',
          position: 1,
          color: 'orange',
        },
        {
          id: '3c4bc637-13da-48b1-a510-badf0de8f838',
          value: SLACK_CHANNEL_MODE.SILENT,
          label: 'Silent',
          position: 2,
          color: 'red',
        },
      ],
    },
  ],
});
