import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const BUYER_ON_OPPORTUNITY_ID = 'b64e08c3-4263-4100-add5-8f700c85c741';
export const BUYER_OPPORTUNITIES_ON_PERSON_ID =
  '6a882d40-1987-49b2-91f4-4ed80900be57';

export default defineField({
  universalIdentifier: BUYER_ON_OPPORTUNITY_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'buyer',
  label: 'Buyer',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    BUYER_OPPORTUNITIES_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'buyerId',
  },
});
