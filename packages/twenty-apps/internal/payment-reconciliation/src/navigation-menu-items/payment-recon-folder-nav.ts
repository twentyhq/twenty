import { defineNavigationMenuItem } from 'twenty-sdk';

import { PAY_RECON_FOLDER_NAV_ID } from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PAY_RECON_FOLDER_NAV_ID,
  name: 'Payment Reconciliation',
  icon: 'IconCash',
  position: 0,
});
