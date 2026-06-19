import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
  defineView,
} from 'twenty-sdk/define';

import { PARTNER_ON_OPPORTUNITY_FIELD_ID } from 'src/fields/partner-on-opportunity.field';
import { APPLICATIONS_ON_OPPORTUNITY_FIELD_ID } from 'src/objects/application.object';

export const DEALS_BOARD_VIEW_UNIVERSAL_IDENTIFIER =
  '39c3ffbc-e91a-46b9-a9c6-4d186d5b3dcf';

const OPPORTUNITY_STAGE_FIELD_ID =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.stage
    .universalIdentifier;

export default defineView({
  universalIdentifier: DEALS_BOARD_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Deals',
  icon: 'IconLayoutKanban',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.KANBAN,
  position: 1,
  mainGroupByFieldMetadataUniversalIdentifier: OPPORTUNITY_STAGE_FIELD_ID,
  groups: [
    {
      universalIdentifier: '3d9ee938-572f-4b46-a78d-25bd971dab48',
      fieldValue: 'NEW',
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '2253c89d-385e-4207-8e46-b8afb7544d07',
      fieldValue: 'SCREENING',
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: 'becb8cf2-56b2-4f1d-8da4-3856c48a6ea4',
      fieldValue: 'MEETING',
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '918de88b-3eae-4f6e-9f75-3341f4567ddf',
      fieldValue: 'PROPOSAL',
      position: 3,
      isVisible: true,
    },
    {
      universalIdentifier: '754dc132-94a3-464b-b524-6ae6b4a50e78',
      fieldValue: 'CUSTOMER',
      position: 4,
      isVisible: true,
    },
  ],
  fields: [
    {
      universalIdentifier: '98c37e50-cece-4b5c-b83d-225f644a8151',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.name
          .universalIdentifier,
      position: 0,
      isVisible: true,
    },
    {
      universalIdentifier: '94640b9c-020a-4535-affa-e0b3def4cc2f',
      fieldMetadataUniversalIdentifier: PARTNER_ON_OPPORTUNITY_FIELD_ID,
      position: 1,
      isVisible: true,
    },
    {
      universalIdentifier: '5797b801-ce0d-4098-ac9f-f1ad972ebb13',
      fieldMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields.amount
          .universalIdentifier,
      position: 2,
      isVisible: true,
    },
    {
      universalIdentifier: '65ddf983-822d-4fd7-97a3-6de34527b8de',
      fieldMetadataUniversalIdentifier: OPPORTUNITY_STAGE_FIELD_ID,
      position: 3,
      isVisible: false,
    },
    {
      universalIdentifier: '48d052c0-b00f-40e7-81fa-d30d01a5e784',
      fieldMetadataUniversalIdentifier: APPLICATIONS_ON_OPPORTUNITY_FIELD_ID,
      position: 4,
      isVisible: true,
    },
  ],
  filters: [
    {
      universalIdentifier: 'a536f770-ecc2-4046-822d-5b414ff1a7de',
      fieldMetadataUniversalIdentifier: PARTNER_ON_OPPORTUNITY_FIELD_ID,
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      value: '',
    },
  ],
});
