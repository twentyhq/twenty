import { ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_LINK_PARTNER_FIELD_ID } from 'src/fields/partner-link-partner.field';
import {
  PARTNER_LINK_NAME_FIELD_ID,
  PARTNER_LINK_SORT_ORDER_FIELD_ID,
  PARTNER_LINK_URL_FIELD_ID,
} from 'src/objects/partner-link.object';

export const PARTNER_LINK_RECORD_PAGE_FIELDS_VIEW_ID =
  'e8d1ba61-45fe-4055-9525-6c8bb68e4e0c';

// FIELDS_WIDGET view backing the Partner Link record page side panel.
export default defineView({
  universalIdentifier: PARTNER_LINK_RECORD_PAGE_FIELDS_VIEW_ID,
  name: 'Partner Link Record Page Fields',
  objectUniversalIdentifier: PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    {
      universalIdentifier: '6e637b0a-14fb-4d15-9c6f-2b0746ad6620',
      fieldMetadataUniversalIdentifier: PARTNER_LINK_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '20b89671-7933-4af4-9634-a254729cc2dd',
      fieldMetadataUniversalIdentifier: PARTNER_LINK_URL_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '0ceaa571-61f3-4d27-8a1b-b10c6f1f3601',
      fieldMetadataUniversalIdentifier: PARTNER_LINK_SORT_ORDER_FIELD_ID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '0c996f3f-0184-42ef-976e-c15d84ff7fbf',
      fieldMetadataUniversalIdentifier: PARTNER_LINK_PARTNER_FIELD_ID,
      position: 3,
      isVisible: true,
    },
  ],
});
