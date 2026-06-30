import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import { OPPORTUNITY_IS_LISTED_FIELD_ID } from 'src/fields/opportunity-is-listed.field';
import { OPPORTUNITY_NEED_FIELD_ID } from 'src/fields/opportunity-need.field';
import { OPPORTUNITY_REQUIREMENTS_FIELD_ID } from 'src/fields/opportunity-requirements.field';
import { PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/fields/partner-on-opportunity.field';
import { APPLICATIONS_ON_OPPORTUNITY_FIELD_ID } from 'src/objects/application.object';

const OPPORTUNITY_STAGE_FIELD_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.stage
    .universalIdentifier;
const OPPORTUNITY_AMOUNT_FIELD_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.amount
    .universalIdentifier;
const OPPORTUNITY_CLOSE_DATE_FIELD_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.closeDate
    .universalIdentifier;

export const OPPORTUNITY_RECORD_PAGE_FIELDS_VIEW_ID =
  'aa8a976c-aca6-4ca1-811e-fc3035e055aa';

// FIELDS_WIDGET view backing the Opportunity record page side panel. Relation fields
// (partner, applications) only render in the fields widget when an explicit view marks
// them visible — this is that view.
export default defineView({
  universalIdentifier: OPPORTUNITY_RECORD_PAGE_FIELDS_VIEW_ID,
  name: 'Opportunity Record Page Fields',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    {
      universalIdentifier: '979ac0d4-2db4-48a2-8474-ff8cebd56669',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_STAGE_FIELD_ID,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '3c0f8ac5-914d-4840-b124-36f089b49dcc',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_AMOUNT_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'a6ee4ae4-c905-4143-b7af-fffa0ceabf2d',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_CLOSE_DATE_FIELD_ID,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '5f8c539e-82df-4db6-af05-d4c4f9b262b1',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_IS_LISTED_FIELD_ID,
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: 'd44a8293-f9c5-41f6-9e08-85441475a1ce',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_NEED_FIELD_ID,
      position: 4,
      isVisible: true,
    },
    {
      universalIdentifier: '3a97a3ce-ecfd-417f-8518-120899f1111e',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_REQUIREMENTS_FIELD_ID,
      position: 5,
      isVisible: true,
    },
    {
      universalIdentifier: 'd186d83a-2f6b-4693-b7eb-abc47d110ae8',
      fieldMetadataUniversalIdentifier: PARTNER_ON_OPPORTUNITY_FIELD_ID,
      position: 6,
      isVisible: true,
    },
    {
      universalIdentifier: '5c286d5d-c849-4210-ba55-7a2e7dc28ff1',
      fieldMetadataUniversalIdentifier: APPLICATIONS_ON_OPPORTUNITY_FIELD_ID,
      position: 7,
      isVisible: true,
    },
  ],
});
