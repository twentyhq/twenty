import { defineView } from 'twenty-sdk';

import {
  SOURCE_FILE_VIEW_ID,
  SOURCE_FILE_OBJECT_ID,
  SF_NAME_FIELD_ID,
  SF_FILE_TYPE_FIELD_ID,
  SF_COVERAGE_MONTH_FIELD_ID,
  SF_PARSE_STATUS_FIELD_ID,
  SF_TOTAL_ROWS_FIELD_ID,
  SF_UPLOADED_AT_FIELD_ID,
  CARRIER_CONFIG_ON_SOURCE_FILE_ID,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: SOURCE_FILE_VIEW_ID,
  name: 'Source Files',
  objectUniversalIdentifier: SOURCE_FILE_OBJECT_ID,
  icon: 'IconFileUpload',
  position: 1,
  fields: [
    {
      universalIdentifier: '10a1b2c3-0001-4000-8000-000000000001',
      fieldMetadataUniversalIdentifier: SF_NAME_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier: '10a1b2c3-0001-4000-8000-000000000002',
      fieldMetadataUniversalIdentifier: SF_FILE_TYPE_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier: '10a1b2c3-0001-4000-8000-000000000003',
      fieldMetadataUniversalIdentifier: SF_COVERAGE_MONTH_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier: '10a1b2c3-0001-4000-8000-000000000004',
      fieldMetadataUniversalIdentifier: SF_PARSE_STATUS_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier: '10a1b2c3-0001-4000-8000-000000000005',
      fieldMetadataUniversalIdentifier: SF_TOTAL_ROWS_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier: '10a1b2c3-0001-4000-8000-000000000006',
      fieldMetadataUniversalIdentifier: SF_UPLOADED_AT_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier: '10a1b2c3-0001-4000-8000-000000000007',
      fieldMetadataUniversalIdentifier: CARRIER_CONFIG_ON_SOURCE_FILE_ID,
      isVisible: true,
      size: 12,
      position: 6,
    },
  ],
});
