import { AggregateOperations, ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const PARTNER_NAME_FIELD_ID = 'a0000001-0000-4000-8000-000000000001';
const PARTNER_COUNTRY_FIELD_ID = 'a77d7fa6-c398-47db-af0f-036a5c719f20';
const PARTNER_SCOPE_FIELD_ID = '500021ad-ca42-4fd3-8727-392dd26b722a';
const PARTNER_TIER_FIELD_ID = 'd4fa6461-37b6-49ee-9181-dd482e74a70b';
const PARTNER_VALIDATION_STAGE_FIELD_ID =
  '2ca9856f-f54a-4326-9ff3-668fd7da0b50';

export const PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER =
  'f3d411ce-eb58-4fab-b7de-c3a6d083855f';

export default defineView({
  universalIdentifier: PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partners per Stage',
  icon: 'IconTable',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 0,
  mainGroupByFieldMetadataUniversalIdentifier: PARTNER_VALIDATION_STAGE_FIELD_ID,
  kanbanAggregateOperation: AggregateOperations.COUNT,
  kanbanAggregateOperationFieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_ID,
  groups: [
    {
      universalIdentifier: 'c914c1ae-b4b8-43ac-97b2-9f2781f81f36',
      fieldValue: 'APPLICATION',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '4e9ba1e5-dd20-4d09-9843-f8a8216ec0b8',
      fieldValue: 'POTENTIAL',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '21271ddf-0325-4ef0-adcc-6ea4da2929be',
      fieldValue: 'VALIDATED',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '55f47258-a19e-49c7-84cc-0ae7f14dac09',
      fieldValue: 'FORMER',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '1f32f40a-6ca5-4a70-9e47-e9051fdf2cde',
      fieldValue: 'REJECTED',
      position: 4,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: '98c2a300-72e6-4c97-9177-ddb27476b279',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'f24e637f-9f9c-4012-8a8d-6cf503bf7674',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '1009cf66-d3e4-43d1-9041-8c3966ecbdfe',
      fieldMetadataUniversalIdentifier: PARTNER_SCOPE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'ff01c4e3-b5c6-4832-90eb-ad05d8276e60',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_ID,
      position: 3,
      isVisible: true,
    },
  ],
});
