import { WorkflowActionType } from 'twenty-shared/workflow';

import { buildHandoverWorkflow } from 'src/engine/core-modules/getting-started/utils/build-handover-workflow.util';
import { getWorkflowStepConnectedAccountIds } from 'src/engine/core-modules/getting-started/utils/get-workflow-step-connected-account-ids.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const CONNECTED_ACCOUNT_ID = '20202020-0000-4000-8000-000000000001';

const { steps } = buildHandoverWorkflow({
  connectedAccountId: CONNECTED_ACCOUNT_ID,
  companyIdFieldId: 'company-id-field',
  memberIdFieldId: 'member-id-field',
  opportunityStageFieldId: 'opportunity-stage-field',
});

const withEmailSender = (connectedAccountId: string): WorkflowAction[] =>
  steps.map((step) =>
    step.type === WorkflowActionType.SEND_EMAIL
      ? {
          ...step,
          settings: {
            ...step.settings,
            input: { ...step.settings.input, connectedAccountId },
          },
        }
      : step,
  );

describe('getWorkflowStepConnectedAccountIds', () => {
  it.each([
    {
      description: 'returns the account the handover email sends from',
      steps,
      expectedIds: [CONNECTED_ACCOUNT_ID],
    },
    {
      description:
        'keeps an empty sender, which falls back to a default account',
      steps: withEmailSender(''),
      expectedIds: [''],
    },
    {
      description: 'skips a sender set from a workflow variable',
      steps: withEmailSender('{{trigger.properties.after.ownerId}}'),
      expectedIds: [],
    },
  ])('$description', ({ steps, expectedIds }) => {
    expect(getWorkflowStepConnectedAccountIds({ steps })).toEqual(expectedIds);
  });
});
