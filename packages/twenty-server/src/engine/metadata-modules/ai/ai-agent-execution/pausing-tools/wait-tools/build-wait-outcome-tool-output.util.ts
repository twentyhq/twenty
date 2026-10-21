import { type AgentRunWakeUpOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-wake-up-outcome.type';

export const buildWaitOutcomeToolOutput = (
  // a run dropped, or continued on an answer, while it waits cancels its wait
  outcome:
    | Exclude<AgentRunWakeUpOutcome, { type: 'ANSWERED' }>
    | { type: 'CANCELLED' },
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
    case 'MESSAGE_RECEIVED':
      return {
        success: true,
        message:
          'Stopped waiting: a member wrote in the conversation. Read what they wrote and decide whether to wait again.',
        result: { status: 'cancelled' },
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
