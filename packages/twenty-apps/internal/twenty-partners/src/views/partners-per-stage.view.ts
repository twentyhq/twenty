import { AggregateOperations, ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const PARTNER_NAME_FIELD_ID = 'a0000001-0000-4000-8000-000000000001';
const PARTNER_COUNTRY_FIELD_ID = 'a77d7fa6-c398-47db-af0f-036a5c719f20';
const PARTNER_SCOPE_FIELD_ID = '500021ad-ca42-4fd3-8727-392dd26b722a';
const PARTNER_TIER_FIELD_ID = 'd4fa6461-37b6-49ee-9181-dd482e74a70b';
const PARTNER_VALIDATION_STAGE_FIELD_ID =
  '2ca9856f-f54a-4326-9ff3-668fd7da0b50';

// Prod view id — current TABLE grouped by validationStage (1.1.7 install).
export const PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER =
  '972fec7c-6a10-4ab7-a2ae-5b82e0f672aa';

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
      universalIdentifier: '615909f0-5bb8-46a7-8e31-9dbe71e8783e',
      fieldValue: 'APPLICATION',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '60761273-760a-45a1-b556-2a2f79ca08b9',
      fieldValue: 'POTENTIAL',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '0ad73459-80c7-426c-9f3c-4b78e816f996',
      fieldValue: 'VALIDATED',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: 'b0f5a6d2-c757-45ab-b7f3-c88ed929ffc8',
      fieldValue: 'FORMER',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '2614f48d-dc5f-4e8f-a7d5-51f8a605fd3b',
      fieldValue: 'REJECTED',
      position: 4,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'c34c2063-30fc-41a3-97f2-532cb2a03246',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'c6b6aaa8-0027-433a-b1b5-411cbb4c0b89',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '3ef82c01-bc52-4a85-8ac3-931648e76b4c',
      fieldMetadataUniversalIdentifier: PARTNER_SCOPE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '1d0c0dd8-f94a-4523-8c89-14eed8f14b76',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_ID,
      position: 3,
      isVisible: true,
    },
  ],
});
