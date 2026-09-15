import { FathomError } from 'fathom-typescript/sdk/models/errors';

export const buildFathomServerError = (): FathomError =>
  new FathomError('Service unavailable', {
    response: new Response(null, { status: 503 }),
    request: new Request('https://api.fathom.ai/external/v1/webhooks'),
    body: '',
  });
