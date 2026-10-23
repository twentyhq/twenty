import { type GenericAbortSignal } from 'axios';

// Maps each signal built here back to the caller's own signal, so a retried request gets a fresh timeout.
const CALLER_SIGNAL_BY_REQUEST_SIGNAL = new WeakMap<
  AbortSignal,
  AbortSignal | undefined
>();

const resolveCallerSignal = (
  currentSignal: GenericAbortSignal | undefined,
): AbortSignal | undefined => {
  if (!(currentSignal instanceof AbortSignal)) {
    return undefined;
  }

  if (CALLER_SIGNAL_BY_REQUEST_SIGNAL.has(currentSignal)) {
    return CALLER_SIGNAL_BY_REQUEST_SIGNAL.get(currentSignal);
  }

  return currentSignal;
};

export const createOutboundRequestSignal = ({
  currentSignal,
  timeoutMs,
}: {
  currentSignal: GenericAbortSignal | undefined;
  timeoutMs: number;
}): AbortSignal => {
  const callerSignal = resolveCallerSignal(currentSignal);
  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  const requestSignal = callerSignal
    ? AbortSignal.any([callerSignal, timeoutSignal])
    : timeoutSignal;

  CALLER_SIGNAL_BY_REQUEST_SIGNAL.set(requestSignal, callerSignal);

  return requestSignal;
};
