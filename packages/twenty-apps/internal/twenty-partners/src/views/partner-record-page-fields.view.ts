import { ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_COMPANY_FIELD_ID } from 'src/fields/partner-company.field';
import { PARTNER_USER_ON_PARTNER_FIELD_ID } from 'src/fields/partner-user-on-partner.field';

const PARTNER_NAME_FIELD_ID = 'a0000001-0000-4000-8000-000000000001';
const PARTNER_VALIDATION_STAGE_FIELD_ID =
  '2ca9856f-f54a-4326-9ff3-668fd7da0b50';
const PARTNER_AVAILABILITY_FIELD_ID = 'a0000004-0000-4000-8000-000000000004';
const PARTNER_REGION_FIELD_ID = '560503de-6330-4c1d-af97-a8dee125f2ad';
const PARTNER_TIER_FIELD_ID = 'd4fa6461-37b6-49ee-9181-dd482e74a70b';

export const PARTNER_RECORD_PAGE_FIELDS_VIEW_ID =
  'a10bf4de-0770-4bee-ae04-1ae97aa18254';

// FIELDS_WIDGET view backing the Partner record page side panel. Relation fields
// (partnerUser) only render in the fields widget when an explicit view marks them
// visible — this is that view.
export default defineView({
  universalIdentifier: PARTNER_RECORD_PAGE_FIELDS_VIEW_ID,
  name: 'Partner Record Page Fields',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    {
      universalIdentifier: '1077c424-bbb4-44cd-afec-7170d961574e',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '3487e2ae-0feb-41c4-ad0c-f94dff435015',
      fieldMetadataUniversalIdentifier: PARTNER_VALIDATION_STAGE_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'd61ac88b-139a-417d-8767-1db77a44d1a5',
      fieldMetadataUniversalIdentifier: PARTNER_AVAILABILITY_FIELD_ID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: 'a85dc9bc-a5f5-446e-a36c-492f1b6c0035',
      fieldMetadataUniversalIdentifier: PARTNER_REGION_FIELD_ID,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '971c79e6-381e-4346-86a4-7119de4824be',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_ID,
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: 'ec1148d4-01ff-4128-9863-0ac42ea8eb47',
      fieldMetadataUniversalIdentifier: PARTNER_USER_ON_PARTNER_FIELD_ID,
      position: 5,
      isVisible: true,
    },
    {
      universalIdentifier: '3ec293a1-da90-4104-a22e-771c0059e9b5',
      fieldMetadataUniversalIdentifier: PARTNER_COMPANY_FIELD_ID,
      position: 6,
      isVisible: true,
    },
  ],
});
