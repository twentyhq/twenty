import { RESEND_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/navigation-menu-items/resend-folder-navigation-menu-item';
import { RESEND_EMAIL_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/views/resend-email-view';
import { defineNavigationMenuItem } from 'twenty-sdk';
import { NavigationMenuItemType } from 'twenty-shared/types';

export default defineNavigationMenuItem({
  universalIdentifier: '9d99110c-68ba-41c0-bd95-9b829ab84974',
  name: 'Emails',
  icon: 'IconMail',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RESEND_EMAIL_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: RESEND_FOLDER_UNIVERSAL_IDENTIFIER,
});
