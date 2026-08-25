import {
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  defineView,
  getFieldUniversalIdentifier,
} from 'twenty-sdk/define';

import {
  APPLICATION_INBOX_VIEW_UNIVERSAL_IDENTIFIER,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import {
  PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_HOURLY_RATE_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_REVIEWED_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_TWENTY_EXPERIENCE_PROOF_LINK_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_TYPE_OF_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
  PARTNER_VALIDATION_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/modules/partner/constants/partner-field-universal-identifiers';
import { PARTNER_PRE_REVIEW_VERDICT_FIELD_ID } from 'src/modules/partner/pre-review/fields/partner-pre-review-verdict.field';

const PARTNER_CREATED_AT_FIELD_ID = getFieldUniversalIdentifier({
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  name: 'createdAt',
});

export default defineView({
  universalIdentifier: APPLICATION_INBOX_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Application Inbox',
  icon: 'IconGavel',
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  position: 5,
  fields: [
    {
      universalIdentifier: '4543ee65-7b44-4454-bd7e-99d8ded89d52',
      fieldMetadataUniversalIdentifier: PARTNER_PRE_REVIEW_VERDICT_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 160,
    },
    {
      universalIdentifier: '38e537d9-8717-461e-a984-371dfd7e16eb',
      fieldMetadataUniversalIdentifier: PARTNER_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      position: 1,
      isVisible: true,
      size: 220,
    },
    {
      universalIdentifier: '16ef1334-2bb2-4184-bb28-2fb5884676d2',
      fieldMetadataUniversalIdentifier:
        PARTNER_COUNTRY_FIELD_UNIVERSAL_IDENTIFIER,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '6fecbbc2-fde0-4441-93be-b762edd38dde',
      fieldMetadataUniversalIdentifier:
        PARTNER_TYPE_OF_TEAM_FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '4f0e1c1a-2e42-4352-98b6-be435032da6d',
      fieldMetadataUniversalIdentifier:
        PARTNER_HOURLY_RATE_FIELD_UNIVERSAL_IDENTIFIER,
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: 'f34b116e-191d-4c08-b6b0-cf1c151d7de9',
      fieldMetadataUniversalIdentifier:
        PARTNER_TWENTY_EXPERIENCE_PROOF_LINK_FIELD_UNIVERSAL_IDENTIFIER,
      position: 5,
      isVisible: true,
      size: 240,
    },
    {
      universalIdentifier: 'd445e59c-6cbe-43e3-8b5b-1adf58a62e8d',
      fieldMetadataUniversalIdentifier: PARTNER_CREATED_AT_FIELD_ID,
      position: 6,
      isVisible: true,
      size: 180,
    },
  ],
  filters: [
    {
      universalIdentifier: '0537c5d1-48ec-4dec-a09d-8bad7411d004',
      fieldMetadataUniversalIdentifier:
        PARTNER_VALIDATION_STAGE_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: ['APPLICATION'],
    },
    {
      universalIdentifier: 'a37fbbd8-8f33-4cf0-8955-827d3480f6c3',
      fieldMetadataUniversalIdentifier:
        PARTNER_REVIEWED_FIELD_UNIVERSAL_IDENTIFIER,
      operand: ViewFilterOperand.IS,
      value: 'false',
    },
  ],
  sorts: [
    {
      universalIdentifier: '53571998-cd50-4325-95a6-8df4eaee7ad7',
      fieldMetadataUniversalIdentifier: PARTNER_PRE_REVIEW_VERDICT_FIELD_ID,
      direction: ViewSortDirection.ASC,
    },
    {
      universalIdentifier: '561838ba-3cc0-488d-bdd4-f7e3cb6b94ac',
      fieldMetadataUniversalIdentifier: PARTNER_CREATED_AT_FIELD_ID,
      direction: ViewSortDirection.DESC,
    },
  ],
});
