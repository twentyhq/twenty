import { ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const PARTNER_NAME_FIELD_ID = 'a0000001-0000-4000-8000-000000000001';
const PARTNER_COUNTRY_FIELD_ID = 'a77d7fa6-c398-47db-af0f-036a5c719f20';
const PARTNER_SCOPE_FIELD_ID = '500021ad-ca42-4fd3-8727-392dd26b722a';
const PARTNER_TIER_FIELD_ID = 'd4fa6461-37b6-49ee-9181-dd482e74a70b';

// Prod view id — recreated as TABLE on 1.1.5 install (KANBAN→TABLE cannot update in place).
export const PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER =
  '8f48bcad-6f09-4fb8-a96c-ad9ee0403eab';

export default defineView({
  universalIdentifier: PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partners per Stage',
  icon: 'IconTable',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 0,
  fields: [
    {
      universalIdentifier: '5b81149d-af9a-4941-a65e-04b771ccc974',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '883aaea7-f8fc-49c3-b61e-98082ee57dd4',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '6ab29216-deb0-49d0-96db-683123278948',
      fieldMetadataUniversalIdentifier: PARTNER_SCOPE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '7ec2f4e7-2c43-42a2-bd04-b20dfe913491',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_ID,
      position: 3,
      isVisible: true,
    },
  ],
});
