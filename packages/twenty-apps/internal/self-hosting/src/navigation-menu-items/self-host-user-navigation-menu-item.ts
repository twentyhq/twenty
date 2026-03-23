import { defineNavigationMenuItem } from 'twenty-sdk';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers.constant';

export default defineNavigationMenuItem({
  universalIdentifier: 'fe3aaca4-9eda-4565-b215-5d268fbf8164',
  name: 'Self host user',
  icon: 'IconList',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier:
    UNIVERSAL_IDENTIFIERS.views.selfHostingUserView.universalIdentifier,
});
