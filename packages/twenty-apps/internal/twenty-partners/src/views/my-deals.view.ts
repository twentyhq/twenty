import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

export const MY_DEALS_VIEW_UNIVERSAL_IDENTIFIER =
  '09c9b985-6dce-43ec-a6b3-5e878e1aec74';

const OPPORTUNITY_NAME_FIELD_ID = '20202020-8609-4f65-a2d9-44009eb422b5';
const OPPORTUNITY_STAGE_FIELD_ID = '20202020-6f76-477d-8551-28cd65b2b4b9';
const OPPORTUNITY_AMOUNT_FIELD_ID = '20202020-583e-4642-8533-db761d5fa82f';

// Partner-facing list of opportunities the partner is actively working.
// partner sees only their own rows once B7 RLS lands; unfiltered pre-B7.
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
    { universalIdentifier: 'c7d850e1-5d95-4097-93a3-02142654a470', fieldMetadataUniversalIdentifier: OPPORTUNITY_STAGE_FIELD_ID, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'fee39824-5859-433e-8f08-c4b9edecca0a', fieldMetadataUniversalIdentifier: OPPORTUNITY_AMOUNT_FIELD_ID, position: 2, isVisible: true, size: 140 },
  ],
});
