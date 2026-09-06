import { Fathom } from 'fathom-typescript';

import { FATHOM_REQUEST_RETRY_MAX_ELAPSED_MILLISECONDS } from 'src/constants/fathom.constant';

// The SDK default retries 429s for five minutes, past every function timeout here.
export const createFathomClient = (accessToken: string): Fathom =>
  new Fathom({
    security: { bearerAuth: accessToken },
    retryConfig: {
      strategy: 'backoff',
      backoff: {
        initialInterval: 500,
        maxInterval: 10_000,
        exponent: 1.5,
        maxElapsedTime: FATHOM_REQUEST_RETRY_MAX_ELAPSED_MILLISECONDS,
      },
      retryConnectionErrors: false,
    },
  });
