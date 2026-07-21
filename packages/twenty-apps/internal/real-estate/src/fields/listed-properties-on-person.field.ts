import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';
import {
  LISTED_PROPERTIES_ON_PERSON_ID,
  LISTING_AGENT_ON_PROPERTY_ID,
} from './listing-agent-on-property.field';

export default defineField({
  universalIdentifier: LISTED_PROPERTIES_ON_PERSON_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.RELATION,
  name: 'listedProperties',
  label: 'Listed properties',
  icon: 'IconHome',
  relationTargetObjectMetadataUniversalIdentifier:
    PROPERTY_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: LISTING_AGENT_ON_PROPERTY_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
