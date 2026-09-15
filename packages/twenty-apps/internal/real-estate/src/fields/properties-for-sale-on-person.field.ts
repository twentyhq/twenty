import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';
import {
  PROPERTIES_FOR_SALE_ON_PERSON_ID,
  SELLER_CONTACT_ON_PROPERTY_ID,
} from './seller-contact-on-property.field';

export default defineField({
  universalIdentifier: PROPERTIES_FOR_SALE_ON_PERSON_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'propertiesForSale',
  label: 'Properties for sale',
  icon: 'IconHome',
  relationTargetObjectMetadataUniversalIdentifier:
    PROPERTY_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SELLER_CONTACT_ON_PROPERTY_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
