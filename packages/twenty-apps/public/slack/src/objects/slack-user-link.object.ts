import {
  defineObject,
  FieldType,
  MetadataWritability,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  SLACK_USER_LINK_CONSENT_STATE_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_TEAM_ID_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  SLACK_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';

export default defineObject({
  universalIdentifier: SLACK_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'slackUserLink',
  namePlural: 'slackUserLinks',
  labelSingular: 'Slack User Link',
  labelPlural: 'Slack User Links',
  description:
    'Links a Slack account to a workspace member so the assistant can act with that member permissions instead of its own.',
  icon: 'IconBrandSlack',
  writability: MetadataWritability.APPLICATION,
  labelIdentifierFieldMetadataUniversalIdentifier:
    SLACK_USER_LINK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: SLACK_USER_LINK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Slack display name captured when the link was created',
      icon: 'IconAbc',
      name: 'name',
    },
    {
      universalIdentifier: SLACK_USER_LINK_TEAM_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack team ID',
      description: 'Slack workspace the account belongs to',
      icon: 'IconHash',
      name: 'slackTeamId',
    },
    {
      universalIdentifier: SLACK_USER_LINK_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Slack user ID',
      description: 'Slack account that the assistant acts for',
      icon: 'IconUser',
      name: 'slackUserId',
    },
    {
      universalIdentifier: SLACK_USER_LINK_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Source',
      description: 'How the link was created',
      icon: 'IconLink',
      defaultValue: `'${SLACK_USER_LINK_SOURCE.AUTO}'`,
      options: [
        {
          id: '40fac522-f850-46c1-a769-4f5d995979b0',
          value: SLACK_USER_LINK_SOURCE.AUTO,
          label: 'Matched on email',
          position: 0,
          color: 'green',
        },
        {
          id: '4409bd26-d641-4b70-9f9d-18dab3e72b90',
          value: SLACK_USER_LINK_SOURCE.MANUAL,
          label: 'Set manually',
          position: 1,
          color: 'blue',
        },
      ],
      name: 'source',
    },
    {
      universalIdentifier:
        SLACK_USER_LINK_CONSENT_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Consent state',
      description:
        'Whether the linked Slack user has consented to the assistant acting with the mapped member permissions',
      icon: 'IconShieldCheck',
      defaultValue: `'${SLACK_USER_LINK_CONSENT_STATE.ACTIVE}'`,
      options: [
        {
          id: '57e1a3f1-37d2-4a1d-a1ed-f69a237a819b',
          value: SLACK_USER_LINK_CONSENT_STATE.ACTIVE,
          label: 'Active',
          position: 0,
          color: 'green',
        },
        {
          id: '99cdcf02-893f-47f8-bb88-77c2ebc85c33',
          value: SLACK_USER_LINK_CONSENT_STATE.PENDING,
          label: 'Awaiting consent',
          position: 1,
          color: 'orange',
        },
        {
          id: '738afb28-4ec5-4d72-879a-319baaf16eae',
          value: SLACK_USER_LINK_CONSENT_STATE.DECLINED,
          label: 'Declined',
          position: 2,
          color: 'red',
        },
        {
          id: '14dab847-b348-4331-bd01-7622939553a3',
          value: SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET,
          label: 'Admin set',
          position: 3,
          color: 'gray',
        },
      ],
      name: 'consentState',
    },
    {
      universalIdentifier:
        SLACK_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
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
        SLACK_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: 'workspaceMemberId',
      },
    },
  ],
});
