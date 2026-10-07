import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';
import { isDefined } from 'twenty-shared/utils';

import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';

export const buildPendingWakeUpOutcome = ({
  condition,
  event,
  answer,
}: {
  condition: PendingWakeUpCondition;
  event?: PendingWakeUpEvent;
  answer?: Extract<PendingWakeUpOutcome, { type: 'ANSWERED' }>['answer'];
}): PendingWakeUpOutcome => {
  if (isDefined(answer)) {
    return { type: 'ANSWERED', answer };
  }

  if (isDefined(event)) {
    return { type: 'EVENT_RECEIVED', event };
  }

  return condition.type === 'TIME'
    ? { type: 'TIME_ELAPSED' }
    : { type: 'EXPIRED' };
};
