import { PENDING_WAKE_UP_RETRY_BASE_DELAY_MS } from 'src/engine/core-modules/pending-wake-up/constants/pending-wake-up-retry-base-delay-ms.constant';
import { PENDING_WAKE_UP_RETRY_MAX_DELAY_MS } from 'src/engine/core-modules/pending-wake-up/constants/pending-wake-up-retry-max-delay-ms.constant';

export const computePendingWakeUpRetryDelayMs = (attempt: number): number =>
  Math.min(
    PENDING_WAKE_UP_RETRY_BASE_DELAY_MS * 2 ** attempt,
    PENDING_WAKE_UP_RETRY_MAX_DELAY_MS,
  );
