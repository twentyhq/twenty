import { FathomError } from 'fathom-typescript/sdk/models/errors';

export const buildFathomRateLimitError = (retryAfter?: string): FathomError =>
  new FathomError('Rate limit exceeded', {
    response: new Response(null, {
      status: 429,
      headers: retryAfter === undefined ? {} : { 'retry-after': retryAfter },
    }),
    request: new Request('https://api.fathom.ai/external/v1/meetings'),
    body: '',
  });
