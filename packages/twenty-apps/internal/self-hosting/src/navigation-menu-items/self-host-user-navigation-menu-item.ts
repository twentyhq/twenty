import { defineNavigationMenuItem } from 'twenty-sdk';
import { UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers.constant';

export default defineNavigationMenuItem({
  universalIdentifier: 'fe3aaca4-9eda-4565-b215-5d268fbf8164',
  name: 'Self host user',
  icon: 'IconList',
  position: 1,
  viewUniversalIdentifier:
    UNIVERSAL_IDENTIFIERS.views.selfHostingUserView.universalIdentifier,
});
