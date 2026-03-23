import { defineView } from 'twenty-sdk';

import {
  RECONCILIATION_RUN_VIEW_ID,
  RECONCILIATION_RUN_OBJECT_ID,
  RR_NAME_FIELD_ID,
  RR_TOTAL_BOB_ROWS_FIELD_ID,
  RR_AUTO_MATCHED_FIELD_ID,
  RR_NEEDS_REVIEW_FIELD_ID,
  RR_UNMATCHED_FIELD_ID,
  RR_MISSING_FROM_BOB_FIELD_ID,
  RR_DISCREPANCIES_FOUND_FIELD_ID,
  RR_RUN_STATUS_FIELD_ID,
  MATCH_RESULTS_ON_RECONCILIATION_RUN_ID,
  SOURCE_FILE_ON_RECONCILIATION_RUN_ID,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: RECONCILIATION_RUN_VIEW_ID,
  name: 'Reconciliation Runs',
  objectUniversalIdentifier: RECONCILIATION_RUN_OBJECT_ID,
  icon: 'IconPlayerPlay',
  position: 0,
  fields: [
    {
      universalIdentifier: '50385180-19b0-453e-ba8e-f01744f7db2d',
      fieldMetadataUniversalIdentifier: RR_NAME_FIELD_ID,
      isVisible: true,
      size: 14,
      position: 0,
    },
    {
      universalIdentifier: '1af9105d-935c-470c-af84-40af4ffe1d5e',
      fieldMetadataUniversalIdentifier: RR_RUN_STATUS_FIELD_ID,
      isVisible: true,
      size: 10,
      position: 1,
    },
    {
      universalIdentifier: '2314f527-1857-405e-ac99-25229b5adab8',
      fieldMetadataUniversalIdentifier: RR_TOTAL_BOB_ROWS_FIELD_ID,
      isVisible: true,
      size: 8,
      position: 2,
    },
    {
      universalIdentifier: '5e745940-cfee-4f32-8a6c-ca839ffa97e4',
      fieldMetadataUniversalIdentifier: RR_AUTO_MATCHED_FIELD_ID,
      isVisible: true,
      size: 8,
      position: 3,
    },
    {
      universalIdentifier: '036b7d64-74db-47b8-a01a-eaecc67461c6',
      fieldMetadataUniversalIdentifier: RR_NEEDS_REVIEW_FIELD_ID,
      isVisible: true,
      size: 8,
      position: 4,
    },
    {
      universalIdentifier: 'e57131f4-7bb3-4cac-9876-091f13e1e03a',
      fieldMetadataUniversalIdentifier: RR_UNMATCHED_FIELD_ID,
      isVisible: true,
      size: 8,
      position: 5,
    },
    {
      universalIdentifier: '26130a14-ec03-498b-af5d-ff521da5722f',
      fieldMetadataUniversalIdentifier: RR_MISSING_FROM_BOB_FIELD_ID,
      isVisible: true,
      size: 8,
      position: 6,
    },
    {
      universalIdentifier: '48f53894-5b6d-4dc2-84a9-5a4341a120e1',
      fieldMetadataUniversalIdentifier: RR_DISCREPANCIES_FOUND_FIELD_ID,
      isVisible: true,
      size: 8,
      position: 7,
    },
    {
      universalIdentifier: 'a7c3e1f5-8b2d-4a6e-9f4c-0d1b3e5a7c2f',
      fieldMetadataUniversalIdentifier:
        MATCH_RESULTS_ON_RECONCILIATION_RUN_ID,
      isVisible: true,
      size: 12,
      position: 8,
    },
    {
      universalIdentifier: 'd1ee1c44-831c-4bb4-9fe1-082674e03976',
      fieldMetadataUniversalIdentifier: SOURCE_FILE_ON_RECONCILIATION_RUN_ID,
      isVisible: true,
      size: 12,
      position: 9,
    },
  ],
});
