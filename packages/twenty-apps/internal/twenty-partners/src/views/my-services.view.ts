import { ViewType, defineView } from 'twenty-sdk/define';

import {
  MY_SERVICES_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  PARTNER_SERVICE_DESCRIPTION_FIELD_ID,
  PARTNER_SERVICE_SORT_ORDER_FIELD_ID,
  PARTNER_SERVICE_TITLE_FIELD_ID,
} from 'src/objects/partner-service.object';

// Partner-facing list of the partner's own marketplace services. Row scope comes from
// RLS (partnerUser IS the current member — configure with `yarn rls:configure`).
export default defineView({
  universalIdentifier: MY_SERVICES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'My Services',
  icon: 'IconTool',
  objectUniversalIdentifier: PARTNER_SERVICE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 0,
  fields: [
    {
      universalIdentifier: '125c8b88-71b0-428e-9f38-954a67dbbe28',
      fieldMetadataUniversalIdentifier: PARTNER_SERVICE_TITLE_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '0cc769e2-8aeb-46b6-ab81-55597b8be800',
      fieldMetadataUniversalIdentifier: PARTNER_SERVICE_DESCRIPTION_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 360,
    },
    {
      universalIdentifier: '2b4c5362-1e92-455f-b25e-cacd85b8e1d2',
      fieldMetadataUniversalIdentifier: PARTNER_SERVICE_SORT_ORDER_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 120,
    },
  ],
});
