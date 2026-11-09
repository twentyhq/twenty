import { SsrfBlockedException } from 'src/engine/core-modules/secure-http-client/exceptions/ssrf-blocked.exception';

// axios and follow-redirects each wrap the socket error once, so the guard's error sits a few `cause` levels down.
const MAX_CAUSE_DEPTH = 5;

export const findSsrfBlockedException = (
  error: unknown,
): SsrfBlockedException | undefined => {
  let current: unknown = error;

  for (let depth = 0; depth < MAX_CAUSE_DEPTH; depth++) {
    if (current instanceof SsrfBlockedException) {
      return current;
    }

    if (!(current instanceof Error)) {
      return undefined;
    }

    current = (current as Error & { cause?: unknown }).cause;
  }

  return undefined;
};
