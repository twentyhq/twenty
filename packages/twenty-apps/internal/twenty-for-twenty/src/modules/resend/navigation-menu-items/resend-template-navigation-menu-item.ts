import { RESEND_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/navigation-menu-items/resend-folder-navigation-menu-item';
import { RESEND_TEMPLATE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/views/resend-template-view';
import { defineNavigationMenuItem } from 'twenty-sdk';
import { NavigationMenuItemType } from 'twenty-shared/types';

export default defineNavigationMenuItem({
  universalIdentifier: 'c56546f1-e4f0-4d03-a480-d152e4b8b427',
  name: 'Templates',
  icon: 'IconTemplate',
  position: 3,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RESEND_TEMPLATE_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: RESEND_FOLDER_UNIVERSAL_IDENTIFIER,
});
