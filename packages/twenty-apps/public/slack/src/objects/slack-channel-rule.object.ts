import {
  defineObject,
  FieldType,
  MetadataWritability,
} from 'twenty-sdk/define';

import {
  SLACK_CHANNEL_RULE_CAPABILITY_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_CHANNEL_RULE_CHANNEL_ID_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_CHANNEL_RULE_MODE_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_CHANNEL_RULE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_CHANNEL_RULE_OBJECT_UNIVERSAL_IDENTIFIER,
  SLACK_CHANNEL_RULE_TEAM_ID_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_CHANNEL_RULE_CAPABILITY } from 'src/logic-functions/constants/slack-channel-rule-capability';
import { SLACK_CHANNEL_RULE_MODE } from 'src/logic-functions/constants/slack-channel-rule-mode';

export default defineObject({
  universalIdentifier: SLACK_CHANNEL_RULE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'slackChannelRule',
  namePlural: 'slackChannelRules',
  labelSingular: 'Slack Channel Rule',
  labelPlural: 'Slack Channel Rules',
  description:
    'Decides who the assistant answers in one Slack channel and what it may do there. A channel without a rule follows the workspace access mode with full capability.',
  icon: 'IconBrandSlack',
  writability: MetadataWritability.APPLICATION,
  labelIdentifierFieldMetadataUniversalIdentifier:
    SLACK_CHANNEL_RULE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SLACK_CHANNEL_RULE_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Slack channel name captured when the rule was saved',
      icon: 'IconAbc',
      name: 'name',
    },
    {
      universalIdentifier:
        SLACK_CHANNEL_RULE_CHANNEL_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack channel ID',
      description: 'Channel the rule applies to',
      icon: 'IconHash',
      name: 'slackChannelId',
    },
    {
      universalIdentifier:
        SLACK_CHANNEL_RULE_TEAM_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack team ID',
      description: 'Slack workspace the channel belongs to',
      icon: 'IconHash',
      name: 'slackTeamId',
    },
    {
      universalIdentifier: SLACK_CHANNEL_RULE_MODE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Mode',
      description: 'Who the assistant answers in this channel',
      icon: 'IconLock',
      defaultValue: `'${SLACK_CHANNEL_RULE_MODE.OPEN}'`,
      options: [
        {
          id: '2f5e761b-fd23-41be-8491-c86ab7596fcc',
          value: SLACK_CHANNEL_RULE_MODE.OPEN,
          label: 'Open to anyone',
          position: 0,
          color: 'green',
        },
        {
          id: '028db981-4d77-49e1-bf2c-a5a0240cb180',
          value: SLACK_CHANNEL_RULE_MODE.LINKED_MEMBERS_ONLY,
          label: 'Linked members only',
          position: 1,
          color: 'orange',
        },
        {
          id: '91ef2997-5ff9-4593-913e-d48a0c81e398',
          value: SLACK_CHANNEL_RULE_MODE.SILENT,
          label: 'Silent',
          position: 2,
          color: 'gray',
        },
      ],
      name: 'mode',
    },
    {
      universalIdentifier:
        SLACK_CHANNEL_RULE_CAPABILITY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Capability',
      description: 'What the assistant may do in this channel',
      icon: 'IconShieldCheck',
      defaultValue: `'${SLACK_CHANNEL_RULE_CAPABILITY.FULL}'`,
      options: [
        {
          id: '89d9c95b-ed29-4eef-a4be-c40c6ed20ecd',
          value: SLACK_CHANNEL_RULE_CAPABILITY.FULL,
          label: 'Full',
          position: 0,
          color: 'green',
        },
        {
          id: '9053bd28-6a82-4c30-8668-4d83c94839cb',
          value: SLACK_CHANNEL_RULE_CAPABILITY.READ_ONLY,
          label: 'Read-only',
          position: 1,
          color: 'blue',
        },
      ],
      name: 'capability',
    },
  ],
});
