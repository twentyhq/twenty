import { RESEND_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/navigation-menu-items/resend-folder-navigation-menu-item';
import { RESEND_SEGMENT_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/views/resend-segment-view';
import { defineNavigationMenuItem } from 'twenty-sdk';
import { NavigationMenuItemType } from 'twenty-shared/types';

export default defineNavigationMenuItem({
  universalIdentifier: '6aa7a107-3c7a-4099-9f8e-b1fa21e6f612',
  name: 'Segments',
  icon: 'IconUsersGroup',
  position: 4,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RESEND_SEGMENT_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: RESEND_FOLDER_UNIVERSAL_IDENTIFIER,
});
