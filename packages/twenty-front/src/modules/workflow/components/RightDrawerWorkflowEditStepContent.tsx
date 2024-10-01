import { WorkflowEditActionFormSendEmail } from '@/workflow/components/WorkflowEditActionFormSendEmail';
import { WorkflowEditActionFormServerlessFunction } from '@/workflow/components/WorkflowEditActionFormServerlessFunction';
import { WorkflowEditTriggerForm } from '@/workflow/components/WorkflowEditTriggerForm';
import { TRIGGER_STEP_ID } from '@/workflow/constants/TriggerStepId';
import { useUpdateWorkflowVersionStep } from '@/workflow/hooks/useUpdateWorkflowVersionStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/hooks/useUpdateWorkflowVersionTrigger';
import { workflowSelectedNodeState } from '@/workflow/states/workflowSelectedNodeState';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { findStepPositionOrThrow } from '@/workflow/utils/findStepPositionOrThrow';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

const getStepDefinitionOrThrow = ({
  stepId,
  workflow,
}: {
  stepId: string;
  workflow: WorkflowWithCurrentVersion;
}) => {
  const currentVersion = workflow.currentVersion;
  if (!isDefined(currentVersion)) {
    throw new Error('Expected to find a current version');
  }

  if (stepId === TRIGGER_STEP_ID) {
    if (!isDefined(currentVersion.trigger)) {
      return {
        type: 'trigger',
        definition: undefined,
      } as const;
    }

    return {
      type: 'trigger',
      definition: currentVersion.trigger,
    } as const;
  }

  if (!isDefined(currentVersion.steps)) {
    throw new Error(
      'Malformed workflow version: missing steps information; be sure to create at least one step before trying to edit one',
    );
  }

  const selectedNodePosition = findStepPositionOrThrow({
    steps: currentVersion.steps,
    stepId: stepId,
  });

  return {
    type: 'action',
    definition: selectedNodePosition.steps[selectedNodePosition.index],
  } as const;
};

export const RightDrawerWorkflowEditStepContent = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const workflowSelectedNode = useRecoilValue(workflowSelectedNodeState);
  if (!isDefined(workflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. Selecting a node is mandatory to edit it.',
    );
  }

  const { updateTrigger } = useUpdateWorkflowVersionTrigger({ workflow });
  const { updateStep } = useUpdateWorkflowVersionStep({
    workflow,
    stepId: workflowSelectedNode,
  });

  const stepDefinition = getStepDefinitionOrThrow({
    stepId: workflowSelectedNode,
    workflow,
  });

  switch (stepDefinition.type) {
    case 'trigger': {
      return (
        <WorkflowEditTriggerForm
          trigger={stepDefinition.definition}
          onTriggerUpdate={updateTrigger}
        />
      );
    }
    case 'action': {
      switch (stepDefinition.definition.type) {
        case 'CODE': {
          return (
            <WorkflowEditActionFormServerlessFunction
              action={stepDefinition.definition}
              onActionUpdate={updateStep}
            />
          );
        }
        case 'SEND_EMAIL': {
          return (
            <WorkflowEditActionFormSendEmail
              action={stepDefinition.definition}
              onActionUpdate={updateStep}
            />
          );
        }
      }
    }
  }

  return assertUnreachable(
    stepDefinition,
    `Unsupported step: ${JSON.stringify(stepDefinition)}`,
  );
};
