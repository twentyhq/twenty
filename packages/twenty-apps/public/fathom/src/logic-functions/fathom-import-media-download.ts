import { defineLogicFunction } from 'twenty-sdk/define';

import { FATHOM_IMPORT_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { runFathomMediaImport } from 'src/logic-functions/utils/run-fathom-media-import.util';

export const fathomImportMediaDownloadHandler = runFathomMediaImport;

export default defineLogicFunction({
  universalIdentifier: FATHOM_IMPORT_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
  name: 'fathom-import-media-download',
  description: 'Resumes media generation and upload for one Fathom recording.',
  timeoutSeconds: 900,
  handler: fathomImportMediaDownloadHandler,
});
