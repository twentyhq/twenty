import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RightDrawerWorkflowEditStepContentAction } from '@/workflow/components/RightDrawerWorkflowEditStepContentAction';
import { RightDrawerWorkflowEditStepContentTrigger } from '@/workflow/components/RightDrawerWorkflowEditStepContentTrigger';
import { showPageWorkflowSelectedNodeState } from '@/workflow/states/showPageWorkflowSelectedNodeState';
import {
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { findStepPositionOrThrow } from '@/workflow/utils/findStepPositionOrThrow';
import { replaceStep } from '@/workflow/utils/replaceStep';
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
          if (!isDefined(workflow.currentVersion)) {
            throw new Error('Can not update an undefined workflow version.');
          }

          updateOneWorkflowVersion({
            idToUpdate: workflow.currentVersion.id,
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
      onUpdateAction={(updatedAction) => {
        if (!isDefined(workflow.currentVersion)) {
          throw new Error('Can not update an undefined workflow version.');
        }

        updateOneWorkflowVersion({
          idToUpdate: workflow.currentVersion.id,
          updateOneRecordInput: {
            steps: replaceStep({
              steps: workflow.currentVersion.steps ?? [],
              stepId: showPageWorkflowSelectedNode,
              stepToReplace: updatedAction,
            }),
          },
        });
      }}
    />
  );
};
