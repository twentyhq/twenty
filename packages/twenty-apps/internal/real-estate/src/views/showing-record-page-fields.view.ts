import { defineView, ViewType } from 'twenty-sdk/define';
import {
  SHOWING_INTEREST_LEVEL_FIELD_UNIVERSAL_IDENTIFIER,
  SHOWING_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  SHOWING_SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  SHOWING_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
  SHOWING_UNIVERSAL_IDENTIFIER,
} from '../objects/showing.object';
import { PROPERTY_ON_SHOWING_ID } from '../fields/property-on-showing.field';
import { BUYER_ON_SHOWING_ID } from '../fields/buyer-on-showing.field';
import { AGENT_ON_SHOWING_ID } from '../fields/agent-on-showing.field';
import { OPPORTUNITY_ON_SHOWING_ID } from '../fields/opportunity-on-showing.field';

const SHOWING_FEEDBACK_FIELD_ID = '377e4a00-8398-413a-8662-526236ff2d65';

export const SHOWING_RECORD_PAGE_FIELDS_VIEW_ID =
  'aab8b6fa-ba20-4a4c-bd51-e3135e2e5b17';

export default defineView({
  universalIdentifier: SHOWING_RECORD_PAGE_FIELDS_VIEW_ID,
  name: 'Showing Record Page Fields',
  objectUniversalIdentifier: SHOWING_UNIVERSAL_IDENTIFIER,
  type: ViewType.FIELDS_WIDGET,
  fields: [
    { universalIdentifier: '005556e9-620f-4dd2-8c80-ff3c2ebf34be', fieldMetadataUniversalIdentifier: SHOWING_NAME_FIELD_UNIVERSAL_IDENTIFIER, position: 0, isVisible: true },
    { universalIdentifier: '18573139-b71f-4939-8a6b-0534dcadca4e', fieldMetadataUniversalIdentifier: SHOWING_SCHEDULED_AT_FIELD_UNIVERSAL_IDENTIFIER, position: 1, isVisible: true },
    { universalIdentifier: 'ba643965-84e5-4298-84fa-e743335d1e65', fieldMetadataUniversalIdentifier: SHOWING_STATUS_FIELD_UNIVERSAL_IDENTIFIER, position: 2, isVisible: true },
    { universalIdentifier: '65a7b779-073a-467d-848b-b93bebb22431', fieldMetadataUniversalIdentifier: SHOWING_INTEREST_LEVEL_FIELD_UNIVERSAL_IDENTIFIER, position: 3, isVisible: true },
    { universalIdentifier: 'a6347283-e422-4fa8-aab7-f6ebbdeb462d', fieldMetadataUniversalIdentifier: SHOWING_FEEDBACK_FIELD_ID, position: 4, isVisible: true },
    { universalIdentifier: 'ef43efbf-7660-4a85-bb38-696e9702e2df', fieldMetadataUniversalIdentifier: PROPERTY_ON_SHOWING_ID, position: 5, isVisible: true },
    { universalIdentifier: '7b49387d-494a-4b19-89bb-19cdc31a2bbd', fieldMetadataUniversalIdentifier: BUYER_ON_SHOWING_ID, position: 6, isVisible: true },
    { universalIdentifier: 'dd260533-802a-439d-bc9e-653b47152acc', fieldMetadataUniversalIdentifier: AGENT_ON_SHOWING_ID, position: 7, isVisible: true },
    { universalIdentifier: 'fc77c926-5301-406e-9785-0c55138ea339', fieldMetadataUniversalIdentifier: OPPORTUNITY_ON_SHOWING_ID, position: 8, isVisible: true },
  ],
});
