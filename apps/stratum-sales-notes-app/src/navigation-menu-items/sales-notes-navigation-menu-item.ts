import {
  SALES_NOTE_NAV_MENU_ITEM_UID,
  SALES_NOTE_VIEW_UID,
} from 'src/constants/universal-identifiers';
import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

// Adds "Sales notes" to the left workspace navigation, pointing at the
// default salesNote view defined in src/views/sales-note-view.ts.
export default defineNavigationMenuItem({
  universalIdentifier: SALES_NOTE_NAV_MENU_ITEM_UID,
  name: 'Sales notes',
  icon: 'IconNotebook',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: SALES_NOTE_VIEW_UID,
});
