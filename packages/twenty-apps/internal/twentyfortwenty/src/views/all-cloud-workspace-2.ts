import { defineView } from 'twenty-sdk';
import { ViewType } from 'twenty-shared/types';

import {
  CLOUD_WORKSPACE_2_ACTIVATION_STATUS_FIELD_ID,
  CLOUD_WORKSPACE_2_ACTIVE_USERS_L24H_FIELD_ID,
  CLOUD_WORKSPACE_2_ACTIVE_USERS_L30D_FIELD_ID,
  CLOUD_WORKSPACE_2_ACTIVE_USERS_L7D_FIELD_ID,
  CLOUD_WORKSPACE_2_ALEXA_RANK_FIELD_ID,
  CLOUD_WORKSPACE_2_ANNUAL_REVENUE_FIELD_ID,
  CLOUD_WORKSPACE_2_ARR_FIELD_ID,
  CLOUD_WORKSPACE_2_COMPANY_FOUNDED_YEAR_FIELD_ID,
  CLOUD_WORKSPACE_2_COMPANY_LINKEDIN_FIELD_ID,
  CLOUD_WORKSPACE_2_COMPANY_NAME_FIELD_ID,
  CLOUD_WORKSPACE_2_CREATOR_EMAIL_FIELD_ID,
  CLOUD_WORKSPACE_2_CUSTOM_DOMAIN_FIELD_ID,
  CLOUD_WORKSPACE_2_DATA_LAST_UPDATED_AT_FIELD_ID,
  CLOUD_WORKSPACE_2_DESCRIPTION_FIELD_ID,
  CLOUD_WORKSPACE_2_EMPLOYEES_FIELD_ID,
  CLOUD_WORKSPACE_2_INDUSTRY_FIELD_ID,
  CLOUD_WORKSPACE_2_IS_ACTIVE_L24H_FIELD_ID,
  CLOUD_WORKSPACE_2_IS_ACTIVE_L30D_FIELD_ID,
  CLOUD_WORKSPACE_2_IS_ACTIVE_L7D_FIELD_ID,
  CLOUD_WORKSPACE_2_IS_ENRICHED_FIELD_ID,
  CLOUD_WORKSPACE_2_LAST_PAGE_VIEW_DATE_FIELD_ID,
  CLOUD_WORKSPACE_2_LATEST_FUNDING_STAGE_FIELD_ID,
  CLOUD_WORKSPACE_2_MRR_FIELD_ID,
  CLOUD_WORKSPACE_2_NEXT_RENEWAL_DATE_FIELD_ID,
  CLOUD_WORKSPACE_2_NUMBER_OF_EVENTS_L30D_FIELD_ID,
  CLOUD_WORKSPACE_2_NUMBER_OF_EVENTS_TOTAL_FIELD_ID,
  CLOUD_WORKSPACE_2_PAGE_VIEWS_L24H_FIELD_ID,
  CLOUD_WORKSPACE_2_PAGE_VIEWS_L30D_FIELD_ID,
  CLOUD_WORKSPACE_2_PAGE_VIEWS_L7D_FIELD_ID,
  CLOUD_WORKSPACE_2_PAYMENT_FREQUENCY_FIELD_ID,
  CLOUD_WORKSPACE_2_POTENTIAL_ARR_FIELD_ID,
  CLOUD_WORKSPACE_2_SUB_DOMAIN_FIELD_ID,
  CLOUD_WORKSPACE_2_SUBSCRIPTION_STATUS_FIELD_ID,
  CLOUD_WORKSPACE_2_TAGS_FIELD_ID,
  CLOUD_WORKSPACE_2_TOTAL_EVER_ACTIVE_WORKSPACE_USERS_FIELD_ID,
  CLOUD_WORKSPACE_2_TOTAL_FUNDING_FIELD_ID,
  CLOUD_WORKSPACE_2_TOTAL_WORKSPACE_USERS_FIELD_ID,
  CLOUD_WORKSPACE_2_UPDATED_BY_FIELD_ID,
  CLOUD_WORKSPACE_2_WORKSPACE_BUSINESS_DOMAIN_FIELD_ID,
  CLOUD_WORKSPACE_2_WORKSPACE_TENURE_FIELD_ID,
} from 'src/fields/cloud-workspace-2-field-ids';
import { CLOUD_WORKSPACE_2_UNIVERSAL_IDENTIFIER } from 'src/objects/cloud-workspace-2';

export const ALL_CLOUD_WORKSPACE_2_VIEW_ID =
  '3747a3a0-25a0-42f0-99d9-61a4b4a76009';

export default defineView({
  universalIdentifier: ALL_CLOUD_WORKSPACE_2_VIEW_ID,
  name: 'all-cloud-workspace-2',
  objectUniversalIdentifier: CLOUD_WORKSPACE_2_UNIVERSAL_IDENTIFIER,
  icon: 'IconList',
  position: 0,
  type: ViewType.TABLE,
  fields: [
    {
      universalIdentifier: '146e3f00-8efc-46be-aafb-a6bafcefa5b0',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_COMPANY_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '10ce2149-d25b-4e21-8215-c628677bc4cb',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_SUB_DOMAIN_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'c8735db0-9a89-4204-ad58-b68b71c10182',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_DESCRIPTION_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 250,
    },
    {
      universalIdentifier: 'cf3f182b-1a69-4274-a200-ef191400a9e8',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_INDUSTRY_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'c932adb5-129b-4457-bbfa-75baaf27707f',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_EMPLOYEES_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 110,
    },
    {
      universalIdentifier: '5f0d33f0-60f0-442c-8c2d-19bfe1c9ea49',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_SUBSCRIPTION_STATUS_FIELD_ID,
      position: 5,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '904e4ecd-f997-42b6-933a-1174cf2bebdc',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_ACTIVATION_STATUS_FIELD_ID,
      position: 6,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'f2d919e7-f782-4edb-ad1a-b99649fbbaf9',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_MRR_FIELD_ID,
      position: 7,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '92afa154-72f2-4b01-8376-2f5311bb40f9',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_ARR_FIELD_ID,
      position: 8,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: 'c63bcd0a-f8d3-4c86-b9c0-6d638d7e9195',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_POTENTIAL_ARR_FIELD_ID,
      position: 9,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: '8659ca48-23b0-4fb8-b588-0919169cae4d',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_ANNUAL_REVENUE_FIELD_ID,
      position: 10,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '1524079b-0e7e-41a6-80bc-85bcdfcab537',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_TOTAL_FUNDING_FIELD_ID,
      position: 11,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: '36a755ee-903c-4c61-b091-ebc0e687333d',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_ACTIVE_USERS_L24H_FIELD_ID,
      position: 12,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '5ac28b38-823f-421c-a177-1749b8283381',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_ACTIVE_USERS_L7D_FIELD_ID,
      position: 13,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '6fa0bfe5-ac55-4165-8830-5c084466c7f5',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_ACTIVE_USERS_L30D_FIELD_ID,
      position: 14,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: 'bee2ed03-23c2-4c99-86db-c0dd4599c669',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_PAGE_VIEWS_L24H_FIELD_ID,
      position: 15,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: 'e8f9775b-c984-4832-800a-3dd26060c0aa',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_PAGE_VIEWS_L7D_FIELD_ID,
      position: 16,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: '95c4fdfc-8fe5-43ce-9885-3f0fc5b4756a',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_PAGE_VIEWS_L30D_FIELD_ID,
      position: 17,
      isVisible: true,
      size: 130,
    },
    {
      universalIdentifier: '6448c0f1-1469-466e-99ed-c7aa015d9e38',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_TOTAL_WORKSPACE_USERS_FIELD_ID,
      position: 18,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '082ed200-9bba-444a-9b28-3a129b7ac9d8',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_TOTAL_EVER_ACTIVE_WORKSPACE_USERS_FIELD_ID,
      position: 19,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'd61bbf0c-48ad-428a-90a1-87b54a87bacf',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_WORKSPACE_TENURE_FIELD_ID,
      position: 20,
      isVisible: true,
      size: 140,
    },
    {
      universalIdentifier: '26058a5b-edde-4caa-a034-32b8edb54ce6',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_IS_ACTIVE_L24H_FIELD_ID,
      position: 21,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '36931d2b-f250-4325-a877-3285dd8a797e',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_IS_ACTIVE_L7D_FIELD_ID,
      position: 22,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: 'c120fc92-4796-4cf4-866f-c1d8c4555321',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_IS_ACTIVE_L30D_FIELD_ID,
      position: 23,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: 'a6674592-070b-41c1-baab-f360984328cc',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_IS_ENRICHED_FIELD_ID,
      position: 24,
      isVisible: true,
      size: 110,
    },
    {
      universalIdentifier: 'd3701295-ef41-46c4-8dd3-b31c27663516',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_CUSTOM_DOMAIN_FIELD_ID,
      position: 25,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'dd22ffe7-95ed-4c67-be33-c2d1592daa32',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_WORKSPACE_BUSINESS_DOMAIN_FIELD_ID,
      position: 26,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'c7a9bcf8-d41d-4ded-b680-868e470e3228',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_COMPANY_LINKEDIN_FIELD_ID,
      position: 27,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: '398eb88f-0d12-446d-a486-d1fb262f82bb',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_CREATOR_EMAIL_FIELD_ID,
      position: 28,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '52d2a1b3-e2b2-4d6b-a5dd-ea8d63c7c369',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_TAGS_FIELD_ID,
      position: 29,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'f74fed2c-94dc-4954-ac27-79acd7e04103',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_PAYMENT_FREQUENCY_FIELD_ID,
      position: 30,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '666d0cea-e50b-4cc8-9ed5-5f5c0ec7fe7e',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_NEXT_RENEWAL_DATE_FIELD_ID,
      position: 31,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '60508519-5ac4-4f96-a30f-5c75d3ce9a93',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_NUMBER_OF_EVENTS_L30D_FIELD_ID,
      position: 32,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '3b1ca2b6-31a1-4755-a9a4-07ee9a9b8a33',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_NUMBER_OF_EVENTS_TOTAL_FIELD_ID,
      position: 33,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '47ba21ab-a5c5-42b9-b1e2-7a988ece154d',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_ALEXA_RANK_FIELD_ID,
      position: 34,
      isVisible: true,
      size: 110,
    },
    {
      universalIdentifier: 'de5e2e42-2600-488c-81d0-f700e7dd0f67',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_COMPANY_FOUNDED_YEAR_FIELD_ID,
      position: 35,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: 'd6bec718-8b50-41e2-95d7-521151e2df82',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_LATEST_FUNDING_STAGE_FIELD_ID,
      position: 36,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '9aaff045-64fa-4857-a8df-7394cf43a120',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_LAST_PAGE_VIEW_DATE_FIELD_ID,
      position: 37,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: 'f2cb82b9-ebb4-4258-971b-061d709f28e5',
      fieldMetadataUniversalIdentifier:
        CLOUD_WORKSPACE_2_DATA_LAST_UPDATED_AT_FIELD_ID,
      position: 38,
      isVisible: true,
      size: 150,
    },
    {
      universalIdentifier: '7e631992-3ae6-478b-9874-67c3b211f05a',
      fieldMetadataUniversalIdentifier: CLOUD_WORKSPACE_2_UPDATED_BY_FIELD_ID,
      position: 39,
      isVisible: true,
      size: 150,
    },
  ],
});
