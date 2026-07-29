import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  SLACK_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_SLACK_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';

export default defineObject({
  universalIdentifier: SLACK_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'slackUserLink',
  namePlural: 'slackUserLinks',
  labelSingular: 'Slack User Link',
  labelPlural: 'Slack User Links',
  description:
    'Maps a Slack user to a Twenty workspace member so the assistant can act with that member permissions. Links are created automatically when the Slack email matches a workspace member, and can be created or corrected by hand.',
  icon: 'IconUserLink',
  labelIdentifierFieldMetadataUniversalIdentifier:
    SLACK_USER_LINK_SLACK_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier:
        SLACK_USER_LINK_SLACK_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack user ID',
      description: 'Slack user this link maps to a workspace member',
      icon: 'IconBrandSlack',
      name: 'slackUserId',
      isUnique: true,
    },
    {
      universalIdentifier:
        SLACK_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      label: 'Workspace member',
      description: 'Twenty member the assistant acts as for this Slack user',
      icon: 'IconUser',
      name: 'workspaceMember',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        SLACK_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: 'workspaceMemberId',
      },
    },
    {
      universalIdentifier: SLACK_USER_LINK_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Source',
      description: 'How the link was established',
      icon: 'IconLink',
      name: 'linkSource',
      defaultValue: `'${SLACK_USER_LINK_SOURCE.MANUAL}'`,
      options: [
        {
          id: '3f3e4b9f-d737-4a27-9dd8-b2b903ea608a',
          value: SLACK_USER_LINK_SOURCE.EMAIL_MATCH,
          label: 'Email match',
          position: 0,
          color: 'blue',
        },
        {
          id: '84ddb656-4321-452b-b751-ecfc34ad382c',
          value: SLACK_USER_LINK_SOURCE.MANUAL,
          label: 'Manual',
          position: 1,
          color: 'green',
        },
      ],
    },
  ],
});
