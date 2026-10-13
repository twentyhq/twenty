import {
  defineObject,
  FieldType,
  MetadataWritability,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  TEAMS_USER_LINK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  TEAMS_USER_LINK_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_USER_LINK_TENANT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_USER_LINK_USER_AAD_OBJECT_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  TEAMS_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/features/chat/constants/universal-identifiers';
import { TEAMS_USER_LINK_SOURCE } from 'src/features/chat/logic-functions/constants/teams-user-link-source';

export default defineObject({
  universalIdentifier: TEAMS_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'teamsUserLink',
  namePlural: 'teamsUserLinks',
  labelSingular: 'Teams User Link',
  labelPlural: 'Teams User Links',
  description:
    'Links a Microsoft Teams account to a workspace member so the assistant can act with that member permissions.',
  icon: 'IconLink',
  writability: MetadataWritability.APPLICATION,
  labelIdentifierFieldMetadataUniversalIdentifier:
    TEAMS_USER_LINK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: TEAMS_USER_LINK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Teams display name captured when the link was created',
      icon: 'IconAbc',
      name: 'name',
    },
    {
      universalIdentifier: TEAMS_USER_LINK_TENANT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Microsoft tenant ID',
      description: 'Microsoft tenant the account belongs to',
      icon: 'IconBuilding',
      name: 'teamsTenantId',
    },
    {
      universalIdentifier:
        TEAMS_USER_LINK_USER_AAD_OBJECT_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Microsoft Entra user ID',
      description:
        'Entra object id of the Teams account the assistant acts for',
      icon: 'IconUser',
      name: 'teamsUserAadObjectId',
    },
    {
      universalIdentifier: TEAMS_USER_LINK_SOURCE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      label: 'Source',
      description: 'How the link was created',
      icon: 'IconLink',
      defaultValue: `'${TEAMS_USER_LINK_SOURCE.AUTO}'`,
      options: [
        {
          id: '9eccbba8-cb1c-43e2-9631-0f61d724c1ac',
          value: TEAMS_USER_LINK_SOURCE.AUTO,
          label: 'Matched on email',
          position: 0,
          color: 'green',
        },
        {
          id: '7fe2bb39-af28-473d-b931-68cb4c0dc037',
          value: TEAMS_USER_LINK_SOURCE.MANUAL,
          label: 'Set manually',
          position: 1,
          color: 'blue',
        },
      ],
      name: 'source',
    },
    {
      universalIdentifier:
        TEAMS_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
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
        TEAMS_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: 'workspaceMemberId',
      },
    },
  ],
});
