import { RightDrawerWorkflowEditStepContentAction } from '@/workflow/components/RightDrawerWorkflowEditStepContentAction';
import { RightDrawerWorkflowEditStepContentTrigger } from '@/workflow/components/RightDrawerWorkflowEditStepContentTrigger';
import { TRIGGER_STEP_ID } from '@/workflow/constants/TriggerStepId';
import { useUpdateWorkflowVersionStep } from '@/workflow/hooks/useUpdateWorkflowVersionStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/hooks/useUpdateWorkflowVersionTrigger';
import { showPageWorkflowSelectedNodeState } from '@/workflow/states/showPageWorkflowSelectedNodeState';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
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
      throw new Error('Expected to find the definition of the trigger');
    }

    return {
      type: 'trigger',
      definition: currentVersion.trigger,
    } as const;
  }

  if (!isDefined(currentVersion.steps)) {
    throw new Error('Expected to find an array of steps');
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
  const showPageWorkflowSelectedNode = useRecoilValue(
    showPageWorkflowSelectedNodeState,
  );
  if (!isDefined(showPageWorkflowSelectedNode)) {
    throw new Error(
      'Expected a node to be selected. Selecting a node is mandatory to edit it.',
    );
  }

  const { updateTrigger } = useUpdateWorkflowVersionTrigger({ workflow });
  const { updateStep } = useUpdateWorkflowVersionStep({
    workflow,
    stepId: showPageWorkflowSelectedNode,
  });

  const stepDefinition = getStepDefinitionOrThrow({
    stepId: showPageWorkflowSelectedNode,
    workflow,
  });

  if (stepDefinition.type === 'trigger') {
    return (
      <RightDrawerWorkflowEditStepContentTrigger
        trigger={stepDefinition.definition}
        onUpdateTrigger={updateTrigger}
      />
    );
  }

  return (
    <RightDrawerWorkflowEditStepContentAction
      action={stepDefinition.definition}
      onUpdateAction={updateStep}
    />
  );
};
