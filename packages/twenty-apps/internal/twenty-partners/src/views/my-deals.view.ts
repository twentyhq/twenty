import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import { OPPORTUNITY_STAGE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/opportunity-stage-options';
import { PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/fields/partner-on-opportunity.field';

export const MY_DEALS_VIEW_UNIVERSAL_IDENTIFIER =
  '09c9b985-6dce-43ec-a6b3-5e878e1aec74';

const OPPORTUNITY_NAME_FIELD_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.name
    .universalIdentifier;
const OPPORTUNITY_AMOUNT_FIELD_ID = '20202020-583e-4642-8533-db761d5fa82f';

// Partner-facing list of opportunities assigned to the partner (partner relation set).
// RLS still allows listed briefs without a partner; this view scopes to assigned deals only.
export default defineView({
  universalIdentifier: MY_DEALS_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'My Deals',
  icon: 'IconHandshake',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  position: 3,
  fields: [
    { universalIdentifier: '5c936e54-687a-4bf4-a995-1d90c71b337e', fieldMetadataUniversalIdentifier: OPPORTUNITY_NAME_FIELD_ID, position: 0, isVisible: true, size: 200 },
    { universalIdentifier: 'c7d850e1-5d95-4097-93a3-02142654a470', fieldMetadataUniversalIdentifier: OPPORTUNITY_STAGE_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'fee39824-5859-433e-8f08-c4b9edecca0a', fieldMetadataUniversalIdentifier: OPPORTUNITY_AMOUNT_FIELD_ID, position: 2, isVisible: true, size: 140 },
  ],
  filters: [
    {
      universalIdentifier: '7e2f4a91-3c8d-4b5e-9f01-2a3b4c5d6e7f',
      fieldMetadataUniversalIdentifier: PARTNER_ON_OPPORTUNITY_FIELD_ID,
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      value: '',
    },
  ],
});
