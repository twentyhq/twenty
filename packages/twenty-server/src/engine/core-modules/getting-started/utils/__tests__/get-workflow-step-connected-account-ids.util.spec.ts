import { WorkflowActionType } from 'twenty-shared/workflow';

import { GETTING_STARTED_HANDOVER_WORKFLOW } from 'src/engine/core-modules/getting-started/constants/getting-started-handover-workflow.constant';
import { buildGettingStartedWorkflowContent } from 'src/engine/core-modules/getting-started/utils/build-getting-started-workflow-content.util';
import { getWorkflowStepConnectedAccountIds } from 'src/engine/core-modules/getting-started/utils/get-workflow-step-connected-account-ids.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const CONNECTED_ACCOUNT_ID = '20202020-0000-4000-8000-000000000001';

const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-01-01T00:00:00Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  }).allFlatEntityMaps;

const { steps: draftSteps } = buildGettingStartedWorkflowContent({
  gettingStartedWorkflow: GETTING_STARTED_HANDOVER_WORKFLOW,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
});

const withEmailSender = (connectedAccountId: string): WorkflowAction[] =>
  draftSteps.map((step) =>
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
      steps: withEmailSender(CONNECTED_ACCOUNT_ID),
      expectedIds: [CONNECTED_ACCOUNT_ID],
    },
    {
      description:
        'keeps the empty sender of the draft, which falls back to a default account',
      steps: draftSteps,
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
