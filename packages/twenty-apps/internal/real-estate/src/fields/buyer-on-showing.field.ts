import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { SHOWING_UNIVERSAL_IDENTIFIER } from '../objects/showing.object';

export const BUYER_ON_SHOWING_ID = '6be576de-50cb-4e3f-b12d-d2538b84d4cc';
export const SHOWINGS_ON_PERSON_ID = '69c1792d-fab7-4b9b-a606-a995782019cd';

export default defineField({
  universalIdentifier: BUYER_ON_SHOWING_ID,
  objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'buyer',
  label: 'Buyer',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: SHOWINGS_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'buyerId',
  },
});
