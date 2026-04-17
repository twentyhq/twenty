import { RESEND_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/navigation-menu-items/resend-folder-navigation-menu-item';
import { RESEND_BROADCAST_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/views/resend-broadcast-view';
import { defineNavigationMenuItem } from 'twenty-sdk';
import { NavigationMenuItemType } from 'twenty-shared/types';

export default defineNavigationMenuItem({
  universalIdentifier: 'cb11a15d-2116-4dd2-9f7d-88ffd2271620',
  name: 'Broadcasts',
  icon: 'IconSpeakerphone',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RESEND_BROADCAST_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: RESEND_FOLDER_UNIVERSAL_IDENTIFIER,
});
