import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { workflowRunIteratorSubStepIterationIndexComponentState } from '@/side-panel/pages/workflow/step/view-run/states/workflowRunIteratorSubStepIterationIndexComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { type WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowRunSSESubscribeEffect } from '@/workflow/workflow-diagram/components/WorkflowRunSSESubscribeEffect';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { useUpdateWorkflowRunStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowRunStep';
import { getIsDescendantOfIterator } from '@/workflow/workflow-steps/utils/getIsDescendantOfIterator';
import { getWorkflowRunStepContext } from '@/workflow/workflow-steps/utils/getWorkflowRunStepContext';
import { WorkflowFormFields } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFields';
import { WorkflowFormStepSubmitButton } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormStepSubmitButton';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { resolveFormInstructions } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/resolveFormInstructions';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';

export type WorkflowEditActionFormFillerProps = {
  action: WorkflowFormAction;
  actionOptions: {
    readonly: boolean;
  };
};

type FormData = WorkflowFormActionField[];

const StyledInstructions = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const WorkflowEditActionFormFiller = ({
  action,
  actionOptions,
}: WorkflowEditActionFormFillerProps) => {
  const [formData, setFormData] = useState<FormData>(action.settings.input);
  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });
  const iterationIndex = useAtomComponentStateValue(
    workflowRunIteratorSubStepIterationIndexComponentState,
  );
  const instructions = isDefined(workflowRun?.state)
    ? resolveFormInstructions({
        instructions: action.settings.instructions,
        context: Object.fromEntries(
          getWorkflowRunStepContext({
            stepId: action.id,
            stepInfos: workflowRun.state.stepInfos,
            flow: workflowRun.state.flow,
            currentLoopIterationIndex: getIsDescendantOfIterator({
              stepId: action.id,
              steps: workflowRun.state.flow.steps,
            })
              ? iterationIndex
              : undefined,
          }).map(({ id, context }) => [id, context]),
        ),
      })
    : undefined;
  const { goBackFromSidePanel } = useSidePanelHistory();
  const { updateWorkflowRunStep } = useUpdateWorkflowRunStep();
  const [error, setError] = useState<string | undefined>(undefined);

  const canSubmit = !actionOptions.readonly && !isDefined(error);

  const onFieldUpdate = (fieldName: string, value: unknown) => {
    if (actionOptions.readonly === true) {
      return;
    }

    const updatedFormData = formData.map((field) =>
      field.name === fieldName ? { ...field, value } : field,
    );

    setFormData(updatedFormData);

    saveAction(updatedFormData);
  };

  const saveAction = useDebouncedCallback(async (updatedFormData: FormData) => {
    if (actionOptions.readonly === true) {
      return;
    }

    await updateWorkflowRunStep({
      workflowRunId,
      step: {
        ...action,
        settings: { ...action.settings, input: updatedFormData },
      },
    });
  }, 1_000);

  const getResponse = async () => {
    await saveAction.flush();

    return Object.fromEntries(
      formData.map((field) => [field.name, field.value]),
    );
  };

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  return (
    <>
      <WorkflowRunSSESubscribeEffect workflowRunId={workflowRunId} />
      <WorkflowStepBody>
        {isDefined(instructions) && (
          <StyledInstructions>{instructions}</StyledInstructions>
        )}
        <WorkflowFormFields
          fields={formData}
          readonly={actionOptions.readonly}
          onChange={onFieldUpdate}
          onError={setError}
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && (
        <SidePanelFooter
          actions={[
            <WorkflowFormStepSubmitButton
              key="submit"
              workflowRunId={workflowRunId}
              stepId={action.id}
              disabled={!canSubmit}
              getResponse={getResponse}
              onSubmitted={goBackFromSidePanel}
            />,
          ]}
        />
      )}
    </>
  );
};
