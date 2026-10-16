import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { assertUnreachable } from 'twenty-shared/utils';

export const getTestPayloadFromTrigger = (
  trigger: WorkflowTrigger,
): Record<string, unknown> | undefined => {
  switch (trigger.type) {
    case 'MANUAL':
    case 'CRON': {
      return undefined;
    }
    case 'WEBHOOK': {
      if (trigger.settings.httpMethod === 'POST') {
        return trigger.settings.expectedBody;
      }

      return undefined;
    }
    case 'DATABASE_EVENT': {
      throw new Error(
        // oxlint-disable-next-line lingui/no-unlocalized-strings -- This message describes a developer-only invariant; keeping it stable preserves error reporting fingerprints.
        'Test workflow is not supported for database event triggers',
      );
    }
    default: {
      return assertUnreachable(trigger, 'Unknown trigger type');
    }
  }
};
