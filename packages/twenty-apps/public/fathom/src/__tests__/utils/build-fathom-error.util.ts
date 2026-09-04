import { FathomError } from 'fathom-typescript/sdk/models/errors';

export const buildFathomError = (statusCode: number): FathomError =>
  new FathomError(`Fathom responded with ${statusCode}`, {
    response: new Response(null, { status: statusCode }),
    request: new Request(
      'https://api.fathom.ai/external/v1/recordings/123/download',
    ),
    body: '',
  });
