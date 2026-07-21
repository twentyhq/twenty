import { defineView, ViewType } from 'twenty-sdk/define';
import {
  PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PROPERTY_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
  PROPERTY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  PROPERTY_UNIVERSAL_IDENTIFIER,
} from '../objects/property.object';
import { LISTING_AGENT_ON_PROPERTY_ID } from '../fields/listing-agent-on-property.field';

export const ALL_PROPERTIES_VIEW_ID = '3cae86f2-c7ea-45ee-8292-507dc5aa7dcf';

export default defineView({
  universalIdentifier: ALL_PROPERTIES_VIEW_ID,
  name: 'All Properties',
  objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconHome',
  position: 0,
  fields: [
    {
      universalIdentifier: '56b7b9fa-950c-4923-b017-51d6ccef35ed',
      fieldMetadataUniversalIdentifier:
        PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: 'b730aca0-0511-4d91-aad8-ea69b90bca8f',
      fieldMetadataUniversalIdentifier:
        PROPERTY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '8241c0d5-eebd-4d83-b509-7d69acaf7892',
      fieldMetadataUniversalIdentifier:
        PROPERTY_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'bbb411f6-51c0-4716-90d8-b1b4b9b1a23a',
      fieldMetadataUniversalIdentifier: LISTING_AGENT_ON_PROPERTY_ID,
      position: 3,
      isVisible: true,
      size: 200,
    },
  ],
});
