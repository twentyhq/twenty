import { ViewType, defineView } from 'twenty-sdk/define';

import {
  MY_LINKS_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  PARTNER_LINK_NAME_FIELD_ID,
  PARTNER_LINK_SORT_ORDER_FIELD_ID,
  PARTNER_LINK_URL_FIELD_ID,
} from 'src/objects/partner-link.object';

// Partner-facing list of the partner's own profile links. Row scope comes from RLS
// (partnerUser IS the current member — configure with `yarn rls:configure`).
export default defineView({
  universalIdentifier: MY_LINKS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'My Links',
  icon: 'IconLink',
  objectUniversalIdentifier: PARTNER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 0,
  fields: [
    {
      universalIdentifier: 'abb1d790-2364-443a-a121-c2b015e44a81',
      fieldMetadataUniversalIdentifier: PARTNER_LINK_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '511d558d-e34c-46b1-a0e6-20e73a40f5aa',
      fieldMetadataUniversalIdentifier: PARTNER_LINK_URL_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '15100bf1-2156-4209-ae97-df92405a6e49',
      fieldMetadataUniversalIdentifier: PARTNER_LINK_SORT_ORDER_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 120,
    },
  ],
});
