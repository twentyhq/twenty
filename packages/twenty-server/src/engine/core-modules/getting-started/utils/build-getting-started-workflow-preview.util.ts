import { type MessageDescriptor } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type GettingStartedWorkflowPreviewDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow-preview.dto';
import { type GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import { type GettingStartedWorkflow } from 'src/engine/core-modules/getting-started/types/getting-started-workflow.type';

export const buildGettingStartedWorkflowPreview = ({
  stepActionKey,
  gettingStartedWorkflow: { manifest, triggerTitle, stepTitles },
  translate,
}: {
  stepActionKey: GettingStartedStepActionKey;
  gettingStartedWorkflow: GettingStartedWorkflow;
  translate: (descriptor: MessageDescriptor) => string;
}): GettingStartedWorkflowPreviewDTO => {
  const { trigger, steps } = manifest.version;

  return {
    stepActionKey,
    trigger: {
      type: trigger.type,
      databaseEventAction:
        trigger.type === 'DATABASE_EVENT' ? trigger.settings.action : null,
      title: translate(triggerTitle),
    },
    actions: steps.flatMap((workflowStep) => {
      const stepTitle = stepTitles[workflowStep.universalIdentifier];

      return isDefined(stepTitle)
        ? [
            {
              type: WorkflowActionType[workflowStep.type],
              title: translate(stepTitle),
            },
          ]
        : [];
    }),
  };
};
