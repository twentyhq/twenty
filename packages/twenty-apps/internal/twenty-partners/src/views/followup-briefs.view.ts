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

export const FOLLOWUP_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER =
  '208374b1-ab8c-414a-ab6e-cf667e58e82c';

const OPPORTUNITY_CREATED_AT_FIELD_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.createdAt
    .universalIdentifier;

export default defineView({
  universalIdentifier: FOLLOWUP_BRIEFS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Follow-up · Briefs',
  icon: 'IconClockExclamation',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  position: 4,
  fields: [
    {
      universalIdentifier: '6c05d4b4-9a9e-4aa6-b3be-b0b2eeec1247',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.name
          .universalIdentifier,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '3bb4a39b-db7f-4976-84ce-983263fc1d39',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_NEED_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: 'e74e0e43-ae5f-4548-a9c1-a24775f94650',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_REQUIREMENTS_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '76005fd9-2501-4004-bc92-bcbe3cb7927f',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_CREATED_AT_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 180,
    },
  ],
  filters: [
    {
      universalIdentifier: 'aca50fdf-e3a7-417c-ba28-411ac67c952a',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_IS_LISTED_FIELD_ID,
      operand: ViewFilterOperand.IS,
      value: 'true',
    },
    {
      universalIdentifier: 'fb283e36-abab-4764-ba19-c9761eb82e57',
      fieldMetadataUniversalIdentifier: PARTNER_ON_OPPORTUNITY_FIELD_ID,
      operand: ViewFilterOperand.IS_EMPTY,
      value: '',
    },
    // TODO(B5): add createdAt > 7d relative filter once operand form confirmed
  ],
});
