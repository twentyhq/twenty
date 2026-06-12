import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';
import {
  TFT_SYNC_EVENTS_NAV_UUID,
  TFT_SYNC_EVENTS_VIEW_UUID,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: TFT_SYNC_EVENTS_NAV_UUID,
  type: NavigationMenuItemType.VIEW,
  icon: 'IconRefresh',
  position: 10,
  viewUniversalIdentifier: TFT_SYNC_EVENTS_VIEW_UUID,
});
