import { isDefined } from 'twenty-shared/utils';
import { isNumber } from '@sniptt/guards';

import { IDLE_CALLBACK_SCHEDULE_DELAY_MS } from '@/polyfills/window-aliases/constants/IdleCallbackScheduleDelayMs';
import { IDLE_CALLBACK_TIME_BUDGET_MS } from '@/polyfills/window-aliases/constants/IdleCallbackTimeBudgetMs';
import { type IdleCallbackScheduler } from '@/polyfills/window-aliases/types/IdleCallbackScheduler';

type CreateIdleDeadlineInput = {
  idleStartTimestamp: number;
  didTimeout: boolean;
};

const createIdleDeadline = ({
  idleStartTimestamp,
  didTimeout,
}: CreateIdleDeadlineInput): IdleDeadline => ({
  didTimeout,
  // A callback invoked because its timeout elapsed gets no budget, like native
  timeRemaining: () =>
    didTimeout
      ? 0
      : Math.max(
          0,
          IDLE_CALLBACK_TIME_BUDGET_MS -
            (performance.now() - idleStartTimestamp),
        ),
});

// No browser exposes requestIdleCallback in workers, so this shim is the only path today
export const createSetTimeoutIdleCallbackScheduler =
  (): IdleCallbackScheduler => {
    let nextIdleCallbackHandle = 1;
    const pendingIdleTimeouts = new Map<
      number,
      ReturnType<typeof setTimeout>
    >();

    return {
      request: (callback, options) => {
        const requestedTimeout = options?.timeout;
        // Only a timeout greater than 0 arms a deadline: 0 is the dictionary
        // default meaning "no timeout", and negatives and NaN mean the same.
        const timeoutMs =
          isNumber(requestedTimeout) && requestedTimeout > 0
            ? requestedTimeout
            : null;
        const requestedAtTimestamp = performance.now();
        const scheduleDelayMs = isDefined(timeoutMs)
          ? Math.min(IDLE_CALLBACK_SCHEDULE_DELAY_MS, timeoutMs)
          : IDLE_CALLBACK_SCHEDULE_DELAY_MS;

        const idleCallbackHandle = nextIdleCallbackHandle;

        nextIdleCallbackHandle += 1;

        // Handles are the shim's own, never raw timer ids: cancel must not be
        // able to clear a timer this scheduler did not schedule.
        pendingIdleTimeouts.set(
          idleCallbackHandle,
          setTimeout(() => {
            pendingIdleTimeouts.delete(idleCallbackHandle);

            const idleStartTimestamp = performance.now();

            callback(
              createIdleDeadline({
                idleStartTimestamp,
                didTimeout:
                  isDefined(timeoutMs) &&
                  idleStartTimestamp - requestedAtTimestamp >= timeoutMs,
              }),
            );
          }, scheduleDelayMs),
        );

        return idleCallbackHandle;
      },
      cancel: (idleCallbackHandle) => {
        const idleTimeout = pendingIdleTimeouts.get(idleCallbackHandle);

        if (!isDefined(idleTimeout)) {
          return;
        }

        pendingIdleTimeouts.delete(idleCallbackHandle);
        clearTimeout(idleTimeout);
      },
    };
  };
