import { type WorkflowTriggerManifest } from 'twenty-shared/application';
import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';

import { assertNever } from 'src/utils/assert';

type DatabaseEventTriggerManifest = Extract<
  WorkflowTriggerManifest,
  { type: 'DATABASE_EVENT' }
>;

const DATABASE_EVENT_TRIGGER_NAME_BY_ACTION: Record<
  DatabaseEventTriggerManifest['settings']['action'],
  string
> = {
  created: 'Record is created',
  updated: 'Record is updated',
  deleted: 'Record is deleted',
  upserted: 'Record is created or updated',
};

export const DEFAULT_WORKFLOW_TRIGGER_POSITION = { x: 0, y: 0 };

export const computeWorkflowTriggerManifestDefaults = (
  trigger: WorkflowTriggerManifest,
): { name: string; outputSchema: Record<string, unknown> } => {
  switch (trigger.type) {
    case 'MANUAL':
      return { name: 'Manual trigger', outputSchema: {} };
    case 'CRON':
      return { name: 'On a schedule', outputSchema: {} };
    case 'DATABASE_EVENT':
      return {
        name: DATABASE_EVENT_TRIGGER_NAME_BY_ACTION[trigger.settings.action],
        outputSchema: {},
      };
    case 'WEBHOOK':
      return {
        name: 'Webhook',
        outputSchema:
          trigger.settings.httpMethod === 'POST'
            ? getOutputSchemaFromValue(trigger.settings.expectedBody)
            : {},
      };
    default:
      return assertNever(trigger);
  }
};
