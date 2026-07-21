import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const SELLER_ON_OPPORTUNITY_ID = 'c3e755f5-2648-448f-8886-c81db4e3a97e';
export const SELLER_OPPORTUNITIES_ON_PERSON_ID =
  '9e617a78-d853-4f46-9947-d0f28dd2cd48';

export default defineField({
  universalIdentifier: SELLER_ON_OPPORTUNITY_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'seller',
  label: 'Seller',
  icon: 'IconUserDollar',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    SELLER_OPPORTUNITIES_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'sellerId',
  },
});
