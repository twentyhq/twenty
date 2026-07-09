import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  LAST_EMAIL_FOR_OPPORTUNITIES_ON_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  OPPORTUNITY_LAST_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_LAST_EMAIL_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'lastEmail',
  label: 'Last email',
  description:
    'The most recent email exchanged with a person related to this opportunity.',
  icon: 'IconMail',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.message.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    LAST_EMAIL_FOR_OPPORTUNITIES_ON_MESSAGE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'lastEmailId',
  },
});
