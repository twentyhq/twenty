// Maps each signal built here back to the caller's own signal, so a retried request gets a fresh timeout.
const CALLER_SIGNAL_BY_REQUEST_SIGNAL = new WeakMap<
  AbortSignal,
  AbortSignal | undefined
>();

export const createOutboundRequestSignal = ({
  currentSignal,
  timeoutMs,
}: {
  currentSignal: unknown;
  timeoutMs: number;
}): AbortSignal => {
  const callerSignal =
    currentSignal instanceof AbortSignal
      ? CALLER_SIGNAL_BY_REQUEST_SIGNAL.has(currentSignal)
        ? CALLER_SIGNAL_BY_REQUEST_SIGNAL.get(currentSignal)
        : currentSignal
      : undefined;

  const timeoutSignal = AbortSignal.timeout(timeoutMs);

  const requestSignal =
    callerSignal instanceof AbortSignal
      ? AbortSignal.any([callerSignal, timeoutSignal])
      : timeoutSignal;

  CALLER_SIGNAL_BY_REQUEST_SIGNAL.set(requestSignal, callerSignal);

  return requestSignal;
};
