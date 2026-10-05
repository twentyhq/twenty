import { SANDBOX_ROUND_TRIP_SETTLE_DELAY } from '@/__stories__/shared/test-utils/timeouts';

export const waitForSandboxRoundTrip = () =>
  new Promise((resolve) =>
    setTimeout(resolve, SANDBOX_ROUND_TRIP_SETTLE_DELAY),
  );
