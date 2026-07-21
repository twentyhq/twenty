import { ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_SERVICE_PARTNER_FIELD_ID } from 'src/fields/partner-service-partner.field';
import {
  PARTNER_SERVICE_DESCRIPTION_FIELD_ID,
  PARTNER_SERVICE_SORT_ORDER_FIELD_ID,
  PARTNER_SERVICE_TITLE_FIELD_ID,
} from 'src/objects/partner-service.object';

export const PARTNER_SERVICE_RECORD_PAGE_FIELDS_VIEW_ID =
  '0dfa3e6b-5461-4494-8a5a-ce363617e5a0';

// FIELDS_WIDGET view backing the Partner Service record page side panel.
export default defineView({
  universalIdentifier: PARTNER_SERVICE_RECORD_PAGE_FIELDS_VIEW_ID,
  name: 'Partner Service Record Page Fields',
  objectUniversalIdentifier: PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    {
      universalIdentifier: '4d042312-363d-4515-870b-4620ef8e7f56',
      fieldMetadataUniversalIdentifier: PARTNER_SERVICE_TITLE_FIELD_ID,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: 'de10bccd-0932-4a16-b1a7-5d8aa039bd46',
      fieldMetadataUniversalIdentifier: PARTNER_SERVICE_DESCRIPTION_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '2d0208c3-41bc-4dc7-9a5b-81b07e1c3647',
      fieldMetadataUniversalIdentifier: PARTNER_SERVICE_SORT_ORDER_FIELD_ID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '3863314c-b426-4b0d-aec4-60624338a658',
      fieldMetadataUniversalIdentifier: PARTNER_SERVICE_PARTNER_FIELD_ID,
      position: 3,
      isVisible: true,
    },
  ],
});
