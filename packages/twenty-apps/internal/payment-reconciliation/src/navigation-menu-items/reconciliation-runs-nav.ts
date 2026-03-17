import { defineNavigationMenuItem } from 'twenty-sdk';

import {
  PAY_RECON_FOLDER_NAV_ID,
  RECONCILIATION_RUNS_NAV_ID,
  RECONCILIATION_RUN_VIEW_ID,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: RECONCILIATION_RUNS_NAV_ID,
  name: 'Reconciliation Runs',
  icon: 'IconPlayerPlay',
  position: 7,
  viewUniversalIdentifier: RECONCILIATION_RUN_VIEW_ID,
  folderUniversalIdentifier: PAY_RECON_FOLDER_NAV_ID,
});
