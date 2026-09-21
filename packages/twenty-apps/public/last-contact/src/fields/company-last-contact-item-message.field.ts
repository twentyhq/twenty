import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  COMPANY_LAST_CONTACT_ITEM_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  COMPANY_LAST_CONTACT_ITEM_MORPH_ID,
  LAST_CONTACT_FOR_COMPANIES_ON_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    COMPANY_LAST_CONTACT_ITEM_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.MORPH_RELATION,
  name: 'lastContactItemMessage',
  label: 'Last contact item',
  description:
    'The email or meeting that was the most recent contact with a person from this company.',
  icon: 'IconMessage',
  isNullable: true,
  morphId: COMPANY_LAST_CONTACT_ITEM_MORPH_ID,
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.message.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    LAST_CONTACT_FOR_COMPANIES_ON_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'lastContactItemMessageId',
  },
  isUIEditable: false,
});
