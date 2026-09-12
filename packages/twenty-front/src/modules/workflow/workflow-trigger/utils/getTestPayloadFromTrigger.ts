import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { buildDatabaseEventTestPayload } from '@/workflow/workflow-trigger/utils/buildDatabaseEventTestPayload';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

export const getTestPayloadFromTrigger = ({
  trigger,
  databaseEventTestRecord,
}: {
  trigger: WorkflowTrigger;
  databaseEventTestRecord?: ObjectRecord;
}): Record<string, unknown> | undefined => {
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
      if (!isDefined(databaseEventTestRecord)) {
        throw new Error(
          'Select a test record on the trigger to test a database event workflow',
        );
      }

      return buildDatabaseEventTestPayload({
        eventName: trigger.settings.eventName,
        record: databaseEventTestRecord,
        watchedFields: trigger.settings.fields,
      });
    }
    default: {
      return assertUnreachable(trigger, 'Unknown trigger type');
    }
  }
};
