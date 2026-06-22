import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  COMMAND_MENU_ITEM_ID,
  CREATE_TICKET_FORM_COMPONENT_ID,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: COMMAND_MENU_ITEM_ID,
  label: 'Create Support Ticket',
  icon: 'IconTicket',
  frontComponentUniversalIdentifier: CREATE_TICKET_FORM_COMPONENT_ID,
});
