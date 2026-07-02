import { ViewFilterOperand, ViewType, defineView } from 'twenty-sdk/define';

import {
  MY_CASE_STUDIES_VIEW_UNIVERSAL_IDENTIFIER,
  PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  PARTNER_CONTENT_CLIENT_NAME_FIELD_ID,
  PARTNER_CONTENT_HEADLINE_FIELD_ID,
  PARTNER_CONTENT_NAME_FIELD_ID,
  PARTNER_CONTENT_STATUS_FIELD_ID,
  PARTNER_CONTENT_TYPE_FIELD_ID,
} from 'src/objects/partner-content.object';

// Partner-facing list of the partner's own case studies. Row scope comes from RLS
// (partnerUser IS the current member — configure with `yarn rls:configure`).
export default defineView({
  universalIdentifier: MY_CASE_STUDIES_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'My Case Studies',
  icon: 'IconBriefcase',
  objectUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 0,
  fields: [
    {
      universalIdentifier: 'b43ffed7-14ec-4911-a307-1fdd3bc96e9c',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '6a976ac9-bc39-430c-93e3-966f41feeeca',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_CLIENT_NAME_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'df0d7227-72a4-49ab-842f-9bc87546caec',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_HEADLINE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: 'dc906677-c1db-493e-9897-98a6a248af5b',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_STATUS_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 140,
    },
  ],
  filters: [
    {
      universalIdentifier: '93a65e11-ba86-4f71-89e0-93f445a34609',
      fieldMetadataUniversalIdentifier: PARTNER_CONTENT_TYPE_FIELD_ID,
      operand: ViewFilterOperand.CONTAINS,
      value: ['CASE_STUDY'],
    },
  ],
});
