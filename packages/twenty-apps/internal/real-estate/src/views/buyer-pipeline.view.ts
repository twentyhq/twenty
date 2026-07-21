import {
  defineView,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  ViewFilterOperand,
  ViewType,
} from 'twenty-sdk/define';
import {
  BUYER_STAGE_FIELD_ID,
  BUYER_STAGE_OPTIONS,
} from '../fields/opportunity-buyer-stage.field';
import { PROPERTY_ON_OPPORTUNITY_ID } from '../fields/property-on-opportunity.field';
import { BUYER_ON_OPPORTUNITY_ID } from '../fields/buyer-on-opportunity.field';

export const BUYER_PIPELINE_VIEW_ID = '4efec37d-ab61-4270-b8d0-f9ff6ff435c9';

const opportunityFields =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.fields;

const GROUP_IDS = [
  'ea85b2b4-4339-4a8d-9f00-b72d436ff315',
  'daee17b1-0b3f-4897-905d-7f9f9ffe09ea',
  '2c710417-40bc-4e64-902c-04962cec780a',
  '2729a148-600e-4bad-b47a-e992ece189ce',
  '6dbc865f-d0fc-4659-ae3a-86fc44db6c7a',
  '64332ad1-f824-4085-b269-19c9c3f7a97d',
];

export default defineView({
  universalIdentifier: BUYER_PIPELINE_VIEW_ID,
  name: 'Buyer Pipeline',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 0,
  mainGroupByFieldMetadataUniversalIdentifier: BUYER_STAGE_FIELD_ID,
  fields: [
    { universalIdentifier: 'aa354542-400a-4d55-bdbb-a7f014d51242', fieldMetadataUniversalIdentifier: opportunityFields.name.universalIdentifier, position: 0, isVisible: true, size: 200 },
    { universalIdentifier: '4eaeae10-80b8-490b-9f24-9a71beec9ac1', fieldMetadataUniversalIdentifier: BUYER_STAGE_FIELD_ID, position: 1, isVisible: true, size: 150 },
    { universalIdentifier: 'e0e095be-1f73-424c-95d6-e0e01e2fc608', fieldMetadataUniversalIdentifier: BUYER_ON_OPPORTUNITY_ID, position: 2, isVisible: true, size: 180 },
    { universalIdentifier: 'f62c744e-2859-4772-b1c5-1584a2e82c95', fieldMetadataUniversalIdentifier: PROPERTY_ON_OPPORTUNITY_ID, position: 3, isVisible: true, size: 180 },
    { universalIdentifier: '1661234f-bd05-4d8e-8716-ab2b17b0e5df', fieldMetadataUniversalIdentifier: opportunityFields.amount.universalIdentifier, position: 4, isVisible: true, size: 150 },
  ],
  groups: BUYER_STAGE_OPTIONS.map((option, index) => ({
    universalIdentifier: GROUP_IDS[index],
    fieldValue: option.value,
    position: index,
    isVisible: true,
  })),
  // Scope the pipeline to real-estate deals (linked to a property),
  // excluding any other opportunities in the workspace.
  filters: [
    {
      universalIdentifier: '57cde77d-5f59-42ca-8722-44fe06689817',
      fieldMetadataUniversalIdentifier: PROPERTY_ON_OPPORTUNITY_ID,
      operand: ViewFilterOperand.IS_NOT_EMPTY,
      value: '',
    },
  ],
});
