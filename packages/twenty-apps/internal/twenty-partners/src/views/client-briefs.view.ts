import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import { OPPORTUNITY_IS_LISTED_FIELD_ID } from 'src/fields/opportunity-is-listed.field';
import { OPPORTUNITY_NEED_FIELD_ID } from 'src/fields/opportunity-need.field';
import { OPPORTUNITY_REQUIREMENTS_FIELD_ID } from 'src/fields/opportunity-requirements.field';
import { PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/fields/partner-on-opportunity.field';

export const CLIENT_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER =
  'd4e8f1a2-3b5c-4d6e-9f0a-1b2c3d4e5f6a';

const OPPORTUNITY_CREATED_AT_FIELD_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.createdAt
    .universalIdentifier;

const OPPORTUNITY_NAME_FIELD_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.name
    .universalIdentifier;

export default defineView({
  universalIdentifier: CLIENT_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Client briefs',
  icon: 'IconFileUpload',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  position: 1,
  fields: [
    {
      universalIdentifier: 'c499f613-9dda-4259-a58c-a812f497f095',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '4b740826-f3a7-4eb7-80b4-4fb15ad7c913',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_NEED_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '621f821b-9eb2-40cf-b1ba-6b645e75e19e',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_REQUIREMENTS_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '7dc4b78b-8552-425c-a939-2c389b33dfdc',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_CREATED_AT_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 180,
    },
    {
      universalIdentifier: 'c323afeb-e33c-46db-80c3-5a44c8600d2d',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_IS_LISTED_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 90,
    },
  ],
  filters: [
    {
      universalIdentifier: 'd6be61ab-258c-45fc-b983-055a6b43c54a',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_IS_LISTED_FIELD_ID,
      operand: ViewFilterOperand.IS,
      value: 'false',
    },
    {
      universalIdentifier: '9e5d1110-bdbc-4e3a-902d-6f3f710e892e',
      fieldMetadataUniversalIdentifier: PARTNER_ON_OPPORTUNITY_FIELD_ID,
      operand: ViewFilterOperand.IS_EMPTY,
      value: '',
    },
    {
      universalIdentifier: '5f11dac5-a624-4dd0-b546-9fa58d701263',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_NAME_FIELD_ID,
      operand: ViewFilterOperand.CONTAINS,
      value: 'client brief',
    },
  ],
});
