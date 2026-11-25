import { createHmac } from 'node:crypto';

import { getUnipileApiKeyOrThrow } from 'src/unipile/utils/get-unipile-api-key-or-throw.util';

export const signLinkedinConnectFlow = (encodedFlow: string): Buffer =>
  createHmac('sha256', getUnipileApiKeyOrThrow())
    .update(`linkedin-connect-flow.${encodedFlow}`)
    .digest();
