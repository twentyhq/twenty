import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';

export const SELLER_CONTACT_ON_PROPERTY_ID =
  '5471ea86-b2bf-4b9e-925f-a4df1d8819b3';
export const PROPERTIES_FOR_SALE_ON_PERSON_ID =
  'eccff600-5ab9-46cd-9243-fe8c76ddb144';

export default defineField({
  universalIdentifier: SELLER_CONTACT_ON_PROPERTY_ID,
  objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'sellerContact',
  label: 'Seller',
  icon: 'IconUserDollar',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    PROPERTIES_FOR_SALE_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'sellerContactId',
  },
});
