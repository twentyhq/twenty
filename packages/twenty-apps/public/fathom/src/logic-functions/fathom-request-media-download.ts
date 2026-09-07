import { defineLogicFunction } from 'twenty-sdk/define';

import { FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { runFathomMediaImport } from 'src/logic-functions/utils/run-fathom-media-import.util';

export const fathomRequestMediaDownloadHandler = runFathomMediaImport;

export default defineLogicFunction({
  universalIdentifier: FATHOM_REQUEST_MEDIA_DOWNLOAD_UNIVERSAL_IDENTIFIER,
  name: 'fathom-request-media-download',
  description: 'Requests and imports media for one Fathom recording.',
  timeoutSeconds: 900,
  handler: fathomRequestMediaDownloadHandler,
});
