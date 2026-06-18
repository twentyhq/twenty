import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import { OPPORTUNITY_NEED_FIELD_ID } from 'src/fields/opportunity-need.field';
import { OPPORTUNITY_REQUIREMENTS_FIELD_ID } from 'src/fields/opportunity-requirements.field';
import { PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/fields/partner-on-opportunity.field';

export const BRIEFS_TO_MATCH_VIEW_UNIVERSAL_IDENTIFIER =
  'cdf316f2-b79b-4d3a-8091-44d90b77cb8c';

const OPPORTUNITY_CREATED_AT_FIELD_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.createdAt
    .universalIdentifier;

export default defineView({
  universalIdentifier: BRIEFS_TO_MATCH_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Briefs to Match',
  icon: 'IconUserOff',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.TABLE,
  position: 0,
  fields: [
    {
      universalIdentifier: '1a469b6f-0ee9-41bb-9b4e-4fa917ef41aa',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.name
          .universalIdentifier,
      position: 0,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: '006b23b2-0591-4b7c-bec4-f39ef466f76b',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_NEED_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: '94c584d6-382f-415e-b021-127339612dd3',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_REQUIREMENTS_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 280,
    },
    {
      universalIdentifier: 'd11e3ff9-ef1a-4be6-9970-67a565712433',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_CREATED_AT_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 180,
    },
  ],
  filters: [
    {
      universalIdentifier: '0030e8ec-b20a-41ad-a684-6e7dc42dc4c3',
      fieldMetadataUniversalIdentifier: PARTNER_ON_OPPORTUNITY_FIELD_ID,
      operand: ViewFilterOperand.IS_EMPTY,
      value: '',
    },
  ],
});
