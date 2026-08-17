import { IDLE_CALLBACK_FRAME_BUDGET_MS } from '@/polyfills/window-aliases/constants/IdleCallbackFrameBudgetMs';
import { IDLE_CALLBACK_SCHEDULE_DELAY_MS } from '@/polyfills/window-aliases/constants/IdleCallbackScheduleDelayMs';
import { type IdleCallbackScheduler } from '@/polyfills/window-aliases/types/IdleCallbackScheduler';

const createIdleDeadline = (idleStartTimestamp: number): IdleDeadline => ({
  didTimeout: false,
  timeRemaining: () =>
    Math.max(
      0,
      IDLE_CALLBACK_FRAME_BUDGET_MS - (performance.now() - idleStartTimestamp),
    ),
});

export const createSetTimeoutIdleCallbackScheduler =
  (): IdleCallbackScheduler => ({
    requestIdleCallback: (callback) =>
      setTimeout(() => {
        callback(createIdleDeadline(performance.now()));
      }, IDLE_CALLBACK_SCHEDULE_DELAY_MS),
    cancelIdleCallback: (idleCallbackHandle) => {
      clearTimeout(idleCallbackHandle);
    },
  });
