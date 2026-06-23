import { AggregateOperations, ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const PARTNER_NAME_FIELD_ID = 'a0000001-0000-4000-8000-000000000001';
const PARTNER_COUNTRY_FIELD_ID = 'a77d7fa6-c398-47db-af0f-036a5c719f20';
const PARTNER_SCOPE_FIELD_ID = '500021ad-ca42-4fd3-8727-392dd26b722a';
const PARTNER_TIER_FIELD_ID = 'd4fa6461-37b6-49ee-9181-dd482e74a70b';
const PARTNER_VALIDATION_STAGE_FIELD_ID =
  '2ca9856f-f54a-4326-9ff3-668fd7da0b50';

// Prod view id — grouped TABLE by validationStage (1.1.8 install).
export const PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER =
  'd617c0ec-4680-4661-b836-f55bd5818d01';

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
      universalIdentifier: '206dae2f-0e2c-4f9c-b221-bd20bc7f6f3a',
      fieldValue: 'APPLICATION',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: 'cb7e8665-ec5e-4381-b368-f3a8683a286f',
      fieldValue: 'POTENTIAL',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '7933ecc5-7288-46c3-ab9d-5128872014b6',
      fieldValue: 'VALIDATED',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: 'f8b73d70-e9a1-4656-808b-e48cffcbbe23',
      fieldValue: 'FORMER',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: 'fa61dcab-c9c2-482b-951c-14f8ef93e34e',
      fieldValue: 'REJECTED',
      position: 4,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: '5e83f83f-6bc8-490e-9bd9-4f3b4455d774',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'a11b2e6a-87a1-4fc1-8f05-21bfc91668e0',
      fieldMetadataUniversalIdentifier: PARTNER_COUNTRY_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'a286d270-db12-44ef-88da-a2873ddea5a0',
      fieldMetadataUniversalIdentifier: PARTNER_SCOPE_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '85b58c37-5e29-427e-a9de-1afd6dc60590',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_ID,
      position: 3,
      isVisible: true,
    },
  ],
});
