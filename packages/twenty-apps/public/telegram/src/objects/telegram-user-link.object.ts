import {
  defineObject,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  TELEGRAM_USER_LINK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  TELEGRAM_USER_LINK_TELEGRAM_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_USER_LINK_TELEGRAM_USERNAME_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
  TELEGRAM_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: TELEGRAM_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'telegramUserLink',
  namePlural: 'telegramUserLinks',
  labelSingular: 'Telegram User Link',
  labelPlural: 'Telegram User Links',
  description:
    'Links a Telegram account to a workspace member so the bot can act with that member permissions.',
  icon: 'IconLink',
  disabledObjectPermissionActions: [
    'canUpdateObjectRecords',
    'canSoftDeleteObjectRecords',
    'canDestroyObjectRecords',
  ],
  labelIdentifierFieldMetadataUniversalIdentifier:
    TELEGRAM_USER_LINK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: TELEGRAM_USER_LINK_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Name',
      description: 'Telegram display name captured when the link was created',
      icon: 'IconAbc',
      name: 'name',
    },
    {
      universalIdentifier:
        TELEGRAM_USER_LINK_TELEGRAM_USER_ID_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Telegram user ID',
      description: 'Numeric id of the Telegram account the bot acts for',
      icon: 'IconUser',
      name: 'telegramUserId',
    },
    {
      universalIdentifier:
        TELEGRAM_USER_LINK_TELEGRAM_USERNAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Telegram username',
      description:
        'Username captured when the link was created. Telegram users can change or remove it.',
      icon: 'IconAt',
      name: 'telegramUsername',
    },
    {
      universalIdentifier:
        TELEGRAM_USER_LINK_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RELATION,
      label: 'Workspace member',
      description: 'Member whose permissions the bot borrows',
      icon: 'IconUserCircle',
      name: 'workspaceMember',
      isNullable: true,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        TELEGRAM_USER_LINKS_ON_WORKSPACE_MEMBER_FIELD_UNIVERSAL_IDENTIFIER,
      universalSettings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: OnDeleteAction.CASCADE,
        joinColumnName: 'workspaceMemberId',
      },
    },
  ],
});
