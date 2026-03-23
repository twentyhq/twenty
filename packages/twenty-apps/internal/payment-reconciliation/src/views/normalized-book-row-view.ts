import { defineView } from 'twenty-sdk';

import {
  NORMALIZED_BOOK_ROW_VIEW_ID,
  NORMALIZED_BOOK_ROW_OBJECT_ID,
  NBR_NAME_FIELD_ID,
  NBR_CARRIER_POLICY_NUMBER_FIELD_ID,
  NBR_MEMBER_LAST_NAME_FIELD_ID,
  NBR_MEMBER_FIRST_NAME_FIELD_ID,
  NBR_TRUE_EFFECTIVE_DATE_FIELD_ID,
  NBR_ELIGIBLE_FOR_COMMISSION_FIELD_ID,
  NBR_PAID_THROUGH_DATE_FIELD_ID,
  NBR_TERM_DATE_FIELD_ID,
  SOURCE_FILE_ON_NORMALIZED_BOOK_ROW_ID,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: NORMALIZED_BOOK_ROW_VIEW_ID,
  name: 'Normalized Book Rows',
  objectUniversalIdentifier: NORMALIZED_BOOK_ROW_OBJECT_ID,
  icon: 'IconTable',
  position: 4,
  fields: [
    {
      universalIdentifier: '20a1b2c3-0001-4000-8000-000000000001',
      fieldMetadataUniversalIdentifier: NBR_NAME_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier: '20a1b2c3-0001-4000-8000-000000000002',
      fieldMetadataUniversalIdentifier: NBR_CARRIER_POLICY_NUMBER_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier: '20a1b2c3-0001-4000-8000-000000000003',
      fieldMetadataUniversalIdentifier: NBR_MEMBER_LAST_NAME_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier: '20a1b2c3-0001-4000-8000-000000000004',
      fieldMetadataUniversalIdentifier: NBR_MEMBER_FIRST_NAME_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier: '20a1b2c3-0001-4000-8000-000000000005',
      fieldMetadataUniversalIdentifier: NBR_TRUE_EFFECTIVE_DATE_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier: '20a1b2c3-0001-4000-8000-000000000006',
      fieldMetadataUniversalIdentifier: NBR_ELIGIBLE_FOR_COMMISSION_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier: '20a1b2c3-0001-4000-8000-000000000007',
      fieldMetadataUniversalIdentifier: NBR_PAID_THROUGH_DATE_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 6,
    },
    {
      universalIdentifier: '20a1b2c3-0001-4000-8000-000000000008',
      fieldMetadataUniversalIdentifier: NBR_TERM_DATE_FIELD_ID,
      isVisible: true,
      size: 12,
      position: 7,
    },
    {
      universalIdentifier: '20a1b2c3-0001-4000-8000-000000000009',
      fieldMetadataUniversalIdentifier:
        SOURCE_FILE_ON_NORMALIZED_BOOK_ROW_ID,
      isVisible: true,
      size: 12,
      position: 8,
    },
  ],
});
