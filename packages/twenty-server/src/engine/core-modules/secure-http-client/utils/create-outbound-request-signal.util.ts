import { type GenericAbortSignal } from 'axios';
import { isDefined } from 'twenty-shared/utils';

// Lets a retried request get a fresh timeout instead of inheriting the first attempt's.
const CALLER_SIGNAL_BY_REQUEST_SIGNAL = new WeakMap<
  AbortSignal,
  AbortSignal | undefined
>();

const resolveCallerSignal = (
  currentSignal: GenericAbortSignal | undefined,
): AbortSignal | undefined => {
  if (!isDefined(currentSignal)) {
    return undefined;
  }

  if (currentSignal instanceof AbortSignal) {
    return CALLER_SIGNAL_BY_REQUEST_SIGNAL.has(currentSignal)
      ? CALLER_SIGNAL_BY_REQUEST_SIGNAL.get(currentSignal)
      : currentSignal;
  }

  // AbortSignal.any only accepts native signals, so other implementations are bridged.
  const bridgeAbortController = new AbortController();

  if (currentSignal.aborted) {
    bridgeAbortController.abort();
  } else {
    currentSignal.addEventListener?.('abort', () =>
      bridgeAbortController.abort(),
    );
  }

  return bridgeAbortController.signal;
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

  const requestSignal = isDefined(callerSignal)
    ? AbortSignal.any([callerSignal, timeoutSignal])
    : timeoutSignal;

  CALLER_SIGNAL_BY_REQUEST_SIGNAL.set(requestSignal, callerSignal);

  return requestSignal;
};
