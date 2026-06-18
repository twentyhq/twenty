import { ViewType, defineView } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const PARTNER_VALIDATION_STAGE_FIELD_ID =
  '2ca9856f-f54a-4326-9ff3-668fd7da0b50';
const PARTNER_TIER_FIELD_ID = 'd4fa6461-37b6-49ee-9181-dd482e74a70b';
const PARTNER_AVAILABILITY_FIELD_ID = 'a0000004-0000-4000-8000-000000000004';

export const PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER =
  '6aee3d5a-563b-4106-8837-5b4b1d67f472';

export default defineView({
  universalIdentifier: PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Partners per Stage',
  icon: 'IconColumns',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.KANBAN,
  position: 0,
  mainGroupByFieldMetadataUniversalIdentifier: PARTNER_VALIDATION_STAGE_FIELD_ID,
  groups: [
    {
      universalIdentifier: '24298244-4ce6-435d-91a4-d32d3f2fa6ef',
      fieldValue: 'APPLICATION',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: 'ab1dad6a-d540-4717-8817-9929cce5c4d7',
      fieldValue: 'POTENTIAL',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'df9c9696-fd2a-4d58-a335-10b7596e12ba',
      fieldValue: 'VALIDATED',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '3a23f780-08d9-4930-87a0-a01eefe4f85f',
      fieldValue: 'FORMER',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '50d725e5-56ce-4769-8487-05fedd9bf8bb',
      fieldValue: 'REJECTED',
      position: 4,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: 'c26f881e-f5db-4c8d-ab2a-f69b7e452459',
      fieldMetadataUniversalIdentifier: 'a0000001-0000-4000-8000-000000000001',
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'ce5dcced-f090-4d57-a6d9-0de0cfd08e23',
      fieldMetadataUniversalIdentifier: PARTNER_TIER_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '3719349b-e428-470e-a5c0-5f32e9a5e9f2',
      fieldMetadataUniversalIdentifier: PARTNER_AVAILABILITY_FIELD_ID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: 'f748f9a4-bfc4-42da-ae08-8c8e1412bdbf',
      fieldMetadataUniversalIdentifier: PARTNER_VALIDATION_STAGE_FIELD_ID,
      position: 3,
      isVisible: false,
    },
  ],
});
