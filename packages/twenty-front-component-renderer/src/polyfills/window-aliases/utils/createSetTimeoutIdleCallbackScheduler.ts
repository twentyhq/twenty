import { isDefined } from 'twenty-shared/utils';

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
  timeRemaining: () =>
    Math.max(
      0,
      IDLE_CALLBACK_TIME_BUDGET_MS - (performance.now() - idleStartTimestamp),
    ),
});

// No browser exposes requestIdleCallback in workers, so this shim is the only path today
export const createSetTimeoutIdleCallbackScheduler =
  (): IdleCallbackScheduler => ({
    request: (callback, options) => {
      const requestedTimeout = options?.timeout;
      const scheduleDelayMs = isDefined(requestedTimeout)
        ? Math.min(IDLE_CALLBACK_SCHEDULE_DELAY_MS, requestedTimeout)
        : IDLE_CALLBACK_SCHEDULE_DELAY_MS;

      return setTimeout(() => {
        callback(
          createIdleDeadline({
            idleStartTimestamp: performance.now(),
            didTimeout:
              isDefined(requestedTimeout) &&
              requestedTimeout <= scheduleDelayMs,
          }),
        );
      }, scheduleDelayMs);
    },
    cancel: (idleCallbackHandle) => {
      clearTimeout(idleCallbackHandle);
    },
  });
