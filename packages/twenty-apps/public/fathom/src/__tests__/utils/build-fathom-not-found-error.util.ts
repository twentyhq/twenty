import { FathomError } from 'fathom-typescript/sdk/models/errors';

export const buildFathomNotFoundError = (): FathomError =>
  new FathomError('Not found', {
    response: new Response(null, { status: 404 }),
    request: new Request('https://api.fathom.ai/external/v1/webhooks/1'),
    body: '',
  });
