import { defineView, ViewType } from 'twenty-sdk/define';
import {
  TICKET_OBJECT_ID,
  TICKET_TITLE_FIELD_ID,
  TICKET_STATUS_FIELD_ID,
  TICKET_PRIORITY_FIELD_ID,
  TICKET_ASSIGNEE_FIELD_ID,
  TICKET_MULTICA_IDENTIFIER_FIELD_ID,
  TICKET_DUE_DATE_FIELD_ID,
  TICKET_TABLE_VIEW_ID,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: TICKET_TABLE_VIEW_ID,
  name: 'ticket-table',
  objectUniversalIdentifier: TICKET_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconTable',
  position: 1,
  fields: [
    { universalIdentifier: 'fdad0bf2-3a6e-4d77-bd28-a63e2426174e', fieldMetadataUniversalIdentifier: TICKET_TITLE_FIELD_ID, position: 0, isVisible: true, size: 280 },
    { universalIdentifier: '2a93c2de-e70b-44a2-8d55-79a0560034e3', fieldMetadataUniversalIdentifier: TICKET_STATUS_FIELD_ID, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '98f3a34a-a4f5-4fb8-bd8a-314a428a99b9', fieldMetadataUniversalIdentifier: TICKET_PRIORITY_FIELD_ID, position: 2, isVisible: true, size: 140 },
    { universalIdentifier: '919178b5-f47c-4d84-a5c9-095512fecf66', fieldMetadataUniversalIdentifier: TICKET_ASSIGNEE_FIELD_ID, position: 3, isVisible: true, size: 180 },
    { universalIdentifier: 'b0c26792-fe31-492e-b429-67ea64bd23e5', fieldMetadataUniversalIdentifier: TICKET_MULTICA_IDENTIFIER_FIELD_ID, position: 4, isVisible: true, size: 120 },
    { universalIdentifier: 'd5e6f7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a', fieldMetadataUniversalIdentifier: TICKET_DUE_DATE_FIELD_ID, position: 5, isVisible: true, size: 140 },
  ],
});
