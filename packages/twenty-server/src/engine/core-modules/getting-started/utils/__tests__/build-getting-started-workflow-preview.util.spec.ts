import { WorkflowActionType } from 'twenty-shared/workflow';

import { GETTING_STARTED_HANDOVER_WORKFLOW } from 'src/engine/core-modules/getting-started/constants/getting-started-handover-workflow.constant';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { buildGettingStartedWorkflowPreview } from 'src/engine/core-modules/getting-started/utils/build-getting-started-workflow-preview.util';

describe('buildGettingStartedWorkflowPreview', () => {
  it('should list the trigger and the titled steps in order', () => {
    expect(
      buildGettingStartedWorkflowPreview({
        step: GettingStartedStep.HANDOVER_DEALS,
        gettingStartedWorkflow: GETTING_STARTED_HANDOVER_WORKFLOW,
        translate: (descriptor) => descriptor.message ?? '',
      }),
    ).toEqual({
      step: GettingStartedStep.HANDOVER_DEALS,
      trigger: {
        type: 'DATABASE_EVENT',
        databaseEventAction: 'updated',
        title: 'A deal is won',
      },
      actions: [
        {
          type: WorkflowActionType.CREATE_RECORD,
          title: 'Create a kickoff task',
        },
        {
          type: WorkflowActionType.SEND_EMAIL,
          title: 'Email the account owner',
        },
      ],
    });
  });
});
