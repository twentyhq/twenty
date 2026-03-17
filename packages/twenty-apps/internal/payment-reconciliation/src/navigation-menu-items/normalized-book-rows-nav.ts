import { defineNavigationMenuItem } from 'twenty-sdk';

import {
  NORMALIZED_BOOK_ROWS_NAV_ID,
  NORMALIZED_BOOK_ROW_VIEW_ID,
  PAY_RECON_FOLDER_NAV_ID,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: NORMALIZED_BOOK_ROWS_NAV_ID,
  name: 'Normalized Book Rows',
  icon: 'IconTable',
  position: 1,
  viewUniversalIdentifier: NORMALIZED_BOOK_ROW_VIEW_ID,
  folderUniversalIdentifier: PAY_RECON_FOLDER_NAV_ID,
});
