import { defineNavigationMenuItem } from 'twenty-sdk';
import { NavigationMenuItemType } from 'twenty-shared/types';

export const RESEND_FOLDER_UNIVERSAL_IDENTIFIER =
  'd87574b8-f09b-4963-bfa0-9e4afd433035';

export default defineNavigationMenuItem({
  universalIdentifier: RESEND_FOLDER_UNIVERSAL_IDENTIFIER,
  name: 'Resend',
  icon: 'IconMail',
  position: 0,
  type: NavigationMenuItemType.FOLDER,
});
