import {
  defineView,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-sdk/define';
import {
  PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PROPERTY_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
  PROPERTY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  PROPERTY_UNIVERSAL_IDENTIFIER,
} from '../objects/property.object';
import { LISTING_AGENT_ON_PROPERTY_ID } from '../fields/listing-agent-on-property.field';

export const AVAILABLE_PROPERTIES_VIEW_ID =
  '6c41e295-bc6f-430f-b526-d1708c5c6153';

export default defineView({
  universalIdentifier: AVAILABLE_PROPERTIES_VIEW_ID,
  name: 'Available (by price)',
  objectUniversalIdentifier: PROPERTY_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconCoin',
  position: 1,
  fields: [
    { universalIdentifier: '0a80e4b4-f52b-420a-9372-8143ea9d726a', fieldMetadataUniversalIdentifier: PROPERTY_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true, size: 240 },
    { universalIdentifier: 'f53d191c-c9e2-47c1-8e89-b600f77e667e', fieldMetadataUniversalIdentifier: PROPERTY_PRICE_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 150 },
    { universalIdentifier: '3d5d31a7-016a-4d39-8b39-8d850e4c8d90', fieldMetadataUniversalIdentifier: PROPERTY_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true, size: 150 },
    { universalIdentifier: '0987e9ff-6210-468b-8639-7af8c64f23f6', fieldMetadataUniversalIdentifier: LISTING_AGENT_ON_PROPERTY_ID, position: 3, isVisible: true, size: 200 },
  ],
  filters: [
    {
      universalIdentifier: '332e0166-af2b-459c-9de0-045adcf9a275',
      fieldMetadataUniversalIdentifier: PROPERTY_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS_NOT,
      value: ['SOLD'],
    },
  ],
  sorts: [
    {
      universalIdentifier: 'e0c1ee67-a244-462d-aded-6e73fa1030df',
      fieldMetadataUniversalIdentifier: PROPERTY_PRICE_FIELD_UNIVERSAL_IDENTIFIER,
      direction: ViewSortDirection.DESC,
    },
  ],
});
