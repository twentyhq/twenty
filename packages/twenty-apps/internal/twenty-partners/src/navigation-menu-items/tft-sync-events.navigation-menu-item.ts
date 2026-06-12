import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';
import {
  PARTNERS_TFT_SYNC_EVENTS_NAV_UUID,
  PARTNERS_TFT_SYNC_EVENTS_VIEW_UUID,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PARTNERS_TFT_SYNC_EVENTS_NAV_UUID,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconRefresh',
  position: 15,
  viewUniversalIdentifier: PARTNERS_TFT_SYNC_EVENTS_VIEW_UUID,
});
