import { type WorkflowTriggerManifest } from 'twenty-shared/application';
import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { WORKFLOW_TRIGGER_DEFAULT_NAMES } from 'twenty-shared/workflow';

import { assertNever } from 'src/utils/assert';

export const DEFAULT_WORKFLOW_TRIGGER_POSITION = { x: 0, y: 0 };

export const computeWorkflowTriggerManifestDefaults = (
  trigger: WorkflowTriggerManifest,
): { name: string; outputSchema: Record<string, unknown> } => {
  switch (trigger.type) {
    case 'MANUAL':
      // Not the builder's 'Launch manually', which would rename the manual trigger of every synced app
      return { name: 'Manual trigger', outputSchema: {} };
    case 'CRON':
      return { name: WORKFLOW_TRIGGER_DEFAULT_NAMES.CRON, outputSchema: {} };
    case 'DATABASE_EVENT':
      return {
        name: WORKFLOW_TRIGGER_DEFAULT_NAMES.DATABASE_EVENT[
          trigger.settings.action
        ],
        outputSchema: {},
      };
    case 'WEBHOOK':
      return {
        name: WORKFLOW_TRIGGER_DEFAULT_NAMES.WEBHOOK,
        outputSchema:
          trigger.settings.httpMethod === 'POST'
            ? getOutputSchemaFromValue(trigger.settings.expectedBody)
            : {},
      };
    default:
      return assertNever(trigger);
  }
};
