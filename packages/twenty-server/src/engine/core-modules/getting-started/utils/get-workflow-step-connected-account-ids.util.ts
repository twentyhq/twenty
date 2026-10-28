import { isNonEmptyString } from '@sniptt/guards';
import { isValidUuid } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getWorkflowStepConnectedAccountIds = ({
  steps,
}: {
  steps: WorkflowAction[];
}): string[] =>
  steps.flatMap((step) => {
    if (
      step.type !== WorkflowActionType.SEND_EMAIL &&
      step.type !== WorkflowActionType.DRAFT_EMAIL &&
      step.type !== WorkflowActionType.CREATE_CALENDAR_EVENT
    ) {
      return [];
    }

    const { connectedAccountId } = step.settings.input;

    if (isValidUuid(connectedAccountId)) {
      return [connectedAccountId];
    }

    // A variable resolves to a member's own account at run time, while an
    // empty id falls back to a default account, so only the empty id is kept
    return isNonEmptyString(connectedAccountId) ? [] : [''];
  });
