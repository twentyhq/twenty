import { OutboundRequestBlockedError } from 'src/engine/core-modules/secure-http-client/errors/outbound-request-blocked.error';

const MAX_CAUSE_DEPTH = 5;

// A guard refusal on a redirect hop reaches the caller wrapped by follow-redirects and then axios
export const findOutboundRequestBlockedError = (
  error: unknown,
): OutboundRequestBlockedError | undefined => {
  let current = error;

  for (
    let depth = 0;
    depth < MAX_CAUSE_DEPTH && current instanceof Error;
    depth++
  ) {
    if (current instanceof OutboundRequestBlockedError) {
      return current;
    }

    current = (current as Error & { cause?: unknown }).cause;
  }

  return undefined;
};
