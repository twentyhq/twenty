import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { PROPERTY_UNIVERSAL_IDENTIFIER } from '../objects/property.object';

export const LISTING_AGENT_ON_PROPERTY_ID =
  'e958682f-cdf6-4930-9758-743014a5d64a';
export const LISTED_PROPERTIES_ON_PERSON_ID =
  '0d8e78f1-f27e-4164-baeb-7f80b77dd9bc';

export default defineField({
  universalIdentifier: LISTING_AGENT_ON_PROPERTY_ID,
  objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'listingAgent',
  label: 'Listing agent',
  icon: 'IconUserStar',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    LISTED_PROPERTIES_ON_PERSON_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'listingAgentId',
  },
});
