import { defineView } from 'twenty-sdk';
import { ViewType } from 'twenty-shared/types';

import {
  CLOUD_USER_2_ACTIVITY_STATUS_FIELD_ID,
  CLOUD_USER_2_AVG_DAILY_PAGEVIEWS_LAST_30D_FIELD_ID,
  CLOUD_USER_2_DATA_LAST_UPDATED_AT_FIELD_ID,
  CLOUD_USER_2_DAYS_SINCE_LAST_ACTIVITY_FIELD_ID,
  CLOUD_USER_2_EMAIL_FIELD_ID,
  CLOUD_USER_2_FULL_NAME_FIELD_ID,
  CLOUD_USER_2_IS_ACTIVE_L24H_FIELD_ID,
  CLOUD_USER_2_IS_ACTIVE_L30D_FIELD_ID,
  CLOUD_USER_2_IS_ACTIVE_L7D_FIELD_ID,
  CLOUD_USER_2_IS_TWENTY_FIELD_ID,
  CLOUD_USER_2_LAST_ACTIVITY_DATE_FIELD_ID,
  CLOUD_USER_2_PAGE_VIEWS_L24H_FIELD_ID,
  CLOUD_USER_2_PAGE_VIEWS_L30D_FIELD_ID,
  CLOUD_USER_2_PAGE_VIEWS_L7D_FIELD_ID,
  CLOUD_USER_2_UPDATED_BY_FIELD_ID,
  CLOUD_USER_2_USER_TENURE_FIELD_ID,
  CLOUD_USER_2_WORKSPACE_COUNT_FIELD_ID,
} from 'src/fields/cloud-user-2-field-ids';
import { CLOUD_USER_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-user-2';

export const ALL_CLOUD_USER_2_VIEW_ID = 'd6137e11-dbcd-4824-85d3-42fe1ca48cb6';

export default defineView({
  universalIdentifier: ALL_CLOUD_USER_2_VIEW_ID,
  name: 'all-cloud-user-2',
  objectUniversalIdentifier: CLOUD_USER_2_UNIVERSAL_IDENTIFIER,
  icon: 'IconList',
  position: 0,
  type: ViewType.TABLE,
  fields: [
    {
      universalIdentifier: '9e82305e-9fd9-4bf7-8cc5-098eb35a748e',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_FULL_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'ea737839-bcb7-4da1-aaf6-79cda65e6263',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_EMAIL_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'ccd1eca7-c851-4e97-9f0e-48c7139f3ced',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_ACTIVITY_STATUS_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: 'e99c82d3-d2fe-4758-9253-ab2ca2b50ef8',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_IS_TWENTY_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 100,
    },
    {
      universalIdentifier: 'c03da046-30b6-402e-8d4b-10799aa5102d',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_WORKSPACE_COUNT_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: 'e3a787f2-77d1-4865-a5c2-c60976809d4d',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_USER_TENURE_FIELD_ID,
      position: 5,
      isVisible: true,
      size: 110,
    },
    {
      universalIdentifier: '352d77f2-726b-4a75-8c9d-3117cfabedc1',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_IS_ACTIVE_L24H_FIELD_ID,
      position: 6,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: 'cf06d6b0-e425-4daf-8a6d-9b66a058ae80',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_IS_ACTIVE_L7D_FIELD_ID,
      position: 7,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '4ab63729-0b48-4b0b-ac9e-e72f5448998c',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_IS_ACTIVE_L30D_FIELD_ID,
      position: 8,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '8c6a3315-fa47-4a12-b9fe-1775462c803d',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_PAGE_VIEWS_L24H_FIELD_ID,
      position: 9,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: '89011d63-e670-498e-bc8f-142f7ceafd04',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_PAGE_VIEWS_L7D_FIELD_ID,
      position: 10,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: '88816c57-aa5b-4efe-b53a-b288fad24ab4',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_PAGE_VIEWS_L30D_FIELD_ID,
      position: 11,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: '3b0ff937-1eaf-4589-80ec-23abb4f2e204',
      fieldMetadataUniversalIdentifier:
        CLOUD_USER_2_AVG_DAILY_PAGEVIEWS_LAST_30D_FIELD_ID,
      position: 12,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'dee5f679-9ad9-4bc4-94a9-af28d7210699',
      fieldMetadataUniversalIdentifier:
        CLOUD_USER_2_DAYS_SINCE_LAST_ACTIVITY_FIELD_ID,
      position: 13,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '25b4e175-be18-4b20-9c51-5db0a596d968',
      fieldMetadataUniversalIdentifier:
        CLOUD_USER_2_LAST_ACTIVITY_DATE_FIELD_ID,
      position: 14,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'f1706c21-d164-414c-9cf5-4cf376584bb9',
      fieldMetadataUniversalIdentifier:
        CLOUD_USER_2_DATA_LAST_UPDATED_AT_FIELD_ID,
      position: 15,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '88d0f343-42c1-4d36-82df-cfdb74e785eb',
      fieldMetadataUniversalIdentifier: CLOUD_USER_2_UPDATED_BY_FIELD_ID,
      position: 16,
      isVisible: true,
      size: 150,
    },
  ],
});
