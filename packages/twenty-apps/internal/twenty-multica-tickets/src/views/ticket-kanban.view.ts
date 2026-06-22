import { defineView, ViewType } from 'twenty-sdk/define';
import {
  TICKET_OBJECT_ID,
  TICKET_TITLE_FIELD_ID,
  TICKET_STATUS_FIELD_ID,
  TICKET_PRIORITY_FIELD_ID,
  TICKET_KANBAN_VIEW_ID,
} from 'src/constants/universal-identifiers';

export default defineView({
  universalIdentifier: TICKET_KANBAN_VIEW_ID,
  name: 'ticket-kanban',
  objectUniversalIdentifier: TICKET_OBJECT_ID,
  type: ViewType.KANBAN,
  icon: 'IconLayoutKanban',
  position: 0,
  mainGroupByFieldMetadataUniversalIdentifier: TICKET_STATUS_FIELD_ID,
  fields: [
    { universalIdentifier: '8229cb48-6130-4c4a-8052-8e43b32d43fc', fieldMetadataUniversalIdentifier: TICKET_TITLE_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: 'f71f928f-0a23-43e4-9758-09e39bb934f1', fieldMetadataUniversalIdentifier: TICKET_STATUS_FIELD_ID, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'a6fb9f05-b72f-4737-85b1-c0fb72d7dbd4', fieldMetadataUniversalIdentifier: TICKET_PRIORITY_FIELD_ID, position: 2, isVisible: true, size: 140 },
  ],
});
