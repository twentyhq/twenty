import { isPlainObject } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { replaceWithdrawnCurrencyCodeInJson } from 'src/database/commands/upgrade-version-command/2-57/utils/replace-withdrawn-currency-code-in-json.util';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

// Other step types can hold arbitrary JSON, such as an HTTP body sent to a third party
const WORKFLOW_TYPES_WITH_CURRENCY_CODE: unknown[] = [
  WorkflowActionType.FIND_RECORDS,
  WorkflowActionType.FILTER,
  WorkflowActionType.IF_ELSE,
  WorkflowActionType.CREATE_RECORD,
  WorkflowActionType.UPDATE_RECORD,
  WorkflowActionType.UPSERT_RECORD,
  WorkflowTriggerType.DATABASE_EVENT,
];

export const replaceWithdrawnCurrencyCodeInWorkflowJson = (
  json: unknown,
): unknown => {
  if (Array.isArray(json)) {
    return json.map(replaceWithdrawnCurrencyCodeInWorkflowJson);
  }

  return isPlainObject(json) &&
    WORKFLOW_TYPES_WITH_CURRENCY_CODE.includes(json.type)
    ? replaceWithdrawnCurrencyCodeInJson(json)
    : json;
};
