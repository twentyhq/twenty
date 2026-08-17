import { IDLE_CALLBACK_FRAME_BUDGET_MS } from '@/polyfills/window-aliases/constants/IdleCallbackFrameBudgetMs';
import { IDLE_CALLBACK_SCHEDULE_DELAY_MS } from '@/polyfills/window-aliases/constants/IdleCallbackScheduleDelayMs';
import { type IdleCallbackScheduler } from '@/polyfills/window-aliases/types/IdleCallbackScheduler';

export const createSetTimeoutIdleCallbackScheduler =
  (): IdleCallbackScheduler => ({
    requestIdleCallback: (callback) =>
      setTimeout(() => {
        const idleStartTimestamp = performance.now();

        callback({
          didTimeout: false,
          timeRemaining: () =>
            Math.max(
              0,
              IDLE_CALLBACK_FRAME_BUDGET_MS -
                (performance.now() - idleStartTimestamp),
            ),
        });
      }, IDLE_CALLBACK_SCHEDULE_DELAY_MS),
    cancelIdleCallback: (idleCallbackHandle) => {
      clearTimeout(idleCallbackHandle);
    },
  });
