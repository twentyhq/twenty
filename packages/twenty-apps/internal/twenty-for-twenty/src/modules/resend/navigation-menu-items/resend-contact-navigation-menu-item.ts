import { RESEND_FOLDER_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/navigation-menu-items/resend-folder-navigation-menu-item';
import { RESEND_CONTACT_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/resend/views/resend-contact-view';
import { defineNavigationMenuItem } from 'twenty-sdk';
import { NavigationMenuItemType } from 'twenty-shared/types';

export default defineNavigationMenuItem({
  universalIdentifier: '7cf30c1e-3f3c-4250-9141-a6584dc6697b',
  name: 'Contacts',
  icon: 'IconAddressBook',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: RESEND_CONTACT_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: RESEND_FOLDER_UNIVERSAL_IDENTIFIER,
});
