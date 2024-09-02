import { RightDrawerWorkflowEditStepContentAction } from '@/workflow/components/RightDrawerWorkflowEditStepContentAction';
import { RightDrawerWorkflowEditStepContentTrigger } from '@/workflow/components/RightDrawerWorkflowEditStepContentTrigger';
import { useUpdateWorkflowVersionStep } from '@/workflow/hooks/useUpdateWorkflowVersionStep';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/hooks/useUpdateWorkflowVersionTrigger';
import { showPageWorkflowSelectedNodeState } from '@/workflow/states/showPageWorkflowSelectedNodeState';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { findStepPositionOrThrow } from '@/workflow/utils/findStepPositionOrThrow';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

const getStepDefinition = ({
  stepId,
  workflow,
}: {
  stepId: string;
  workflow: WorkflowWithCurrentVersion;
}) => {
  const currentVersion = workflow.currentVersion;
  if (currentVersion === undefined) {
    return undefined;
  }

  if (stepId === 'trigger') {
    if (!isDefined(currentVersion.trigger)) {
      return undefined;
    }

    return {
      type: 'trigger',
      definition: currentVersion.trigger,
    } as const;
  }

  if (!isDefined(currentVersion.steps)) {
    return undefined;
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
  if (showPageWorkflowSelectedNode === undefined) {
    throw new Error(
      'Expected a node to be selected. Selecting a node is mandatory to edit it.',
    );
  }

  const { updateTrigger } = useUpdateWorkflowVersionTrigger({ workflow });
  const { updateStep } = useUpdateWorkflowVersionStep({
    workflow,
    stepId: showPageWorkflowSelectedNode,
  });

  const stepConfiguration = getStepDefinition({
    stepId: showPageWorkflowSelectedNode,
    workflow,
  });
  if (stepConfiguration === undefined) {
    throw new Error('Expected to resolve the definition of the step.');
  }

  if (stepConfiguration.type === 'trigger') {
    return (
      <RightDrawerWorkflowEditStepContentTrigger
        trigger={stepConfiguration.definition}
        onUpdateTrigger={updateTrigger}
      />
    );
  }

  return (
    <RightDrawerWorkflowEditStepContentAction
      action={stepConfiguration.definition}
      onUpdateAction={updateStep}
    />
  );
};
