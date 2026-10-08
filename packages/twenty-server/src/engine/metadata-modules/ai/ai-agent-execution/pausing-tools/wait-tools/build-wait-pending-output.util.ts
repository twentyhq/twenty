import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';

export const buildWaitPendingOutput = ({
  message,
  wait,
}: {
  message: string;
  wait: PendingWakeUpCondition;
}): {
  success: true;
  message: string;
  result: { status: 'pending'; wait: PendingWakeUpCondition };
} => ({
  success: true,
  message,
  result: { status: 'pending', wait },
});
