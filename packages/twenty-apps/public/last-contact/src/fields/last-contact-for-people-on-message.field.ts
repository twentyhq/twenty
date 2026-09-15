import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  LAST_CONTACT_FOR_PEOPLE_ON_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  LAST_CONTACT_ITEM_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    LAST_CONTACT_FOR_PEOPLE_ON_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.message.universalIdentifier,
  type: FieldType.RELATION,
  name: 'lastContactForPeople',
  label: 'Last contact for',
  description: 'People whose most recent contact was this email.',
  icon: 'IconUser',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    LAST_CONTACT_ITEM_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  isUIEditable: false,
});
