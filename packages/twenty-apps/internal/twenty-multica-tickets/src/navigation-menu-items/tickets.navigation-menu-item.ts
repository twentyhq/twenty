import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';
import { TICKET_TABLE_VIEW_ID } from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: '6189e1fb-456c-4ccb-b6f0-b202081fa8ce',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: TICKET_TABLE_VIEW_ID,
});
