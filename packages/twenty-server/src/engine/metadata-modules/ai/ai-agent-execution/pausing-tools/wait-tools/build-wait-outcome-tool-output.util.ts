import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';

export const buildWaitOutcomeToolOutput = (
  // a run dropped while it waits cancels its wait
  outcome: PendingWakeUpOutcome | { type: 'CANCELLED' },
): Record<string, unknown> => {
  switch (outcome.type) {
    case 'TIME_ELAPSED':
      return {
        success: true,
        message: 'The wait is over.',
        result: { status: 'completed' },
      };
    // the agent reads the record with its own tools, so its permissions decide what it sees
    case 'EVENT_RECEIVED': {
      const { eventName, recordId, updatedFields } = outcome.event;

      return {
        success: true,
        message: `${eventName} happened on record ${recordId}.`,
        result: {
          status: 'completed',
          event: { eventName, recordId, updatedFields },
        },
      };
    }
    case 'EXPIRED':
      return {
        success: true,
        message:
          'Stopped waiting: the event did not happen before the timeout.',
        result: { status: 'expired' },
      };
    case 'CANCELLED':
      return {
        success: true,
        message:
          'Stopped waiting: the run was stopped before the wait was over.',
        result: { status: 'cancelled' },
      };
  }
};
