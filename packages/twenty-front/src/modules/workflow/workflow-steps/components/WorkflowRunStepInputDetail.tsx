import { workflowRunIteratorSubStepIterationIndexComponentState } from '@/command-menu/pages/workflow/step/view-run/states/workflowRunIteratorSubStepIterationIndexComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { WorkflowRunStepJsonContainer } from '@/workflow/workflow-steps/components/WorkflowRunStepJsonContainer';
import { getIsDescendantOfIterator } from '@/workflow/workflow-steps/utils/getIsDescendantOfIterator';
import { getWorkflowRunStepContext } from '@/workflow/workflow-steps/utils/getWorkflowRunStepContext';
import { getWorkflowVariablesUsedInStep } from '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconBrackets } from 'twenty-ui/display';
import {
  type GetJsonNodeHighlighting,
  JsonNestedNode,
  JsonTreeContextProvider,
  type ShouldExpandNodeInitiallyProps,
} from 'twenty-ui/json-visualizer';
import { type JsonValue } from 'type-fest';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const WorkflowRunStepInputDetail = ({ stepId }: { stepId: string }) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });
  const step = workflowRun?.state?.flow.steps.find(
    (step) => step.id === stepId,
  );

  const workflowRunIteratorSubStepIterationIndex = useRecoilComponentValue(
    workflowRunIteratorSubStepIterationIndexComponentState,
  );

  if (
    !(
      isDefined(workflowRun) &&
      isDefined(workflowRun.state?.stepInfos) &&
      isDefined(workflowRun.state?.flow) &&
      isDefined(step)
    )
  ) {
    return null;
  }

  const stepDefinition = getStepDefinitionOrThrow({
    stepId,
    trigger: workflowRun.state.flow.trigger,
    steps: workflowRun.state.flow.steps,
  });

  if (stepDefinition?.type !== 'action') {
    throw new Error('The input tab must be rendered with an action step.');
  }

  const variablesUsedInStep = getWorkflowVariablesUsedInStep({
    step,
  });
  const allVariablesUsedInStep = Array.from(variablesUsedInStep);

  const stepContext = getWorkflowRunStepContext({
    stepInfos: workflowRun.state.stepInfos,
    flow: workflowRun.state.flow,
    stepId,
    currentLoopIterationIndex: getIsDescendantOfIterator({
      stepId,
      steps: workflowRun.state.flow.steps,
    })
      ? workflowRunIteratorSubStepIterationIndex
      : undefined,
  });

  if (stepContext.length === 0) {
    throw new Error('The input tab must be rendered with a non-empty context.');
  }

  const previousStepId = stepContext[stepContext.length - 1].id;

  const getNodeHighlighting: GetJsonNodeHighlighting = (keyPath: string) => {
    if (variablesUsedInStep.has(keyPath)) {
      return 'blue';
    }

    const isUsedVariableParent = allVariablesUsedInStep.some((variable) =>
      variable.startsWith(keyPath),
    );
    if (isUsedVariableParent) {
      return 'partial-blue';
    }

    return undefined;
  };

  const isFirstNodeDepthOfPreviousStep = ({
    keyPath,
    depth,
  }: ShouldExpandNodeInitiallyProps) =>
    keyPath.startsWith(previousStepId) && depth < 2;

  return (
    <>
      <WorkflowRunStepJsonContainer>
        <JsonTreeContextProvider
          value={{
            emptyArrayLabel: t`Empty Array`,
            emptyObjectLabel: t`Empty Object`,
            emptyStringLabel: t`[empty string]`,
            arrowButtonCollapsedLabel: t`Expand`,
            arrowButtonExpandedLabel: t`Collapse`,
            getNodeHighlighting,
            shouldExpandNodeInitially: isFirstNodeDepthOfPreviousStep,
            onNodeValueClick: copyToClipboard,
          }}
        >
          <JsonNestedNode
            elements={stepContext.map(({ id, name, context }) => ({
              id,
              label: name,
              value: context as JsonValue,
            }))}
            Icon={IconBrackets}
            depth={0}
            keyPath=""
            emptyElementsText=""
          />
        </JsonTreeContextProvider>
      </WorkflowRunStepJsonContainer>
    </>
  );
};
