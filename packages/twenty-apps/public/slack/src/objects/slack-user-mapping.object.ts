import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  SLACK_USER_MAPPING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_MAPPING_OBJECT_UNIVERSAL_IDENTIFIER,
  SLACK_USER_MAPPING_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_MAPPING_TEAM_ID_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_MAPPING_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_MAPPING_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_MAPPINGS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_USER_MAPPING_SOURCE } from 'src/logic-functions/constants/slack-user-mapping-source';

export default defineObject({
  universalIdentifier: SLACK_USER_MAPPING_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'slackUserMapping',
  namePlural: 'slackUserMappings',
  labelSingular: 'Slack User Mapping',
  labelPlural: 'Slack User Mappings',
  description:
    'Links a Slack account to a workspace member so the assistant can act with that member permissions instead of its own.',
  icon: 'IconBrandSlack',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SLACK_USER_MAPPING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SLACK_USER_MAPPING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Slack display name captured when the mapping was created',
      icon: 'IconAbc',
      name: 'name',
    },
    {
      universalIdentifier:
        SLACK_USER_MAPPING_TEAM_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack team ID',
      description: 'Slack workspace the account belongs to',
      icon: 'IconHash',
      name: 'slackTeamId',
    },
    {
      universalIdentifier:
        SLACK_USER_MAPPING_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack user ID',
      description: 'Slack account that the assistant acts for',
      icon: 'IconUser',
      name: 'slackUserId',
    },
    {
      universalIdentifier: SLACK_USER_MAPPING_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Source',
      description: 'How the mapping was created',
      icon: 'IconLink',
      defaultValue: `'${SLACK_USER_MAPPING_SOURCE.MANUAL}'`,
      options: [
        {
          id: '40fac522-f850-46c1-a769-4f5d995979b0',
          value: SLACK_USER_MAPPING_SOURCE.AUTO,
          label: 'Matched on email',
          position: 0,
          color: 'green',
        },
        {
          id: '4409bd26-d641-4b70-9f9d-18dab3e72b90',
          value: SLACK_USER_MAPPING_SOURCE.MANUAL,
          label: 'Set manually',
          position: 1,
          color: 'blue',
        },
      ],
      name: 'source',
    },
    {
      universalIdentifier:
        SLACK_USER_MAPPING_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      label: 'Workspace member',
      description: 'Member whose permissions the assistant borrows',
      icon: 'IconUserCircle',
      name: 'workspaceMember',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        SLACK_USER_MAPPINGS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: 'workspaceMemberId',
      },
    },
  ],
});
