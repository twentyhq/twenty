import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RightDrawerWorkflowEditStepContentAction } from '@/workflow/components/RightDrawerWorkflowEditStepContentAction';
import { RightDrawerWorkflowEditStepContentTrigger } from '@/workflow/components/RightDrawerWorkflowEditStepContentTrigger';
import { showPageWorkflowSelectedNodeState } from '@/workflow/states/showPageWorkflowSelectedNodeState';
import { Workflow, WorkflowVersion } from '@/workflow/types/Workflow';
import { getWorkflowLastVersion } from '@/workflow/utils/getWorkflowLastVersion';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

// FIXME: copy-pasted
const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
  height: 100%;
`;

const getStepDefinition = ({
  stepId,
  workflow,
}: {
  stepId: string;
  workflow: Workflow;
}) => {
  const workflowLastVersion = getWorkflowLastVersion(workflow);
  if (workflowLastVersion === undefined) {
    return undefined;
  }

  if (stepId === 'trigger') {
    return {
      type: 'trigger',
      definition: workflowLastVersion.trigger,
    } as const;
  }

  const selectedNodeDefinition = workflowLastVersion.steps.find(
    (step) => step.id === stepId,
  );
  if (selectedNodeDefinition === undefined) {
    return undefined;
  }

  return {
    type: 'action',
    definition: selectedNodeDefinition,
  } as const;
};

export const RightDrawerWorkflowEditStepContent = ({
  workflow,
}: {
  workflow: Workflow;
}) => {
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const showPageWorkflowSelectedNode = useRecoilValue(
    showPageWorkflowSelectedNodeState,
  );
  if (showPageWorkflowSelectedNode === undefined) {
    throw new Error(
      'Expected a node to be selected. Selecting a node is mandatory to edit it.',
    );
  }

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
        onUpdateTrigger={(updatedTrigger) => {
          const lastVersion = getWorkflowLastVersion(workflow);
          if (lastVersion === undefined) {
            throw new Error(
              "Can't add a node when no version exists yet. Create a first workflow version before trying to add a node.",
            );
          }

          console.log({ updatedTrigger });

          updateOneWorkflowVersion({
            idToUpdate: lastVersion.id,
            updateOneRecordInput: {
              trigger: updatedTrigger,
            },
          });
        }}
      />
    );
  }

  return (
    <RightDrawerWorkflowEditStepContentAction
      action={stepConfiguration.definition}
    />
  );
};
