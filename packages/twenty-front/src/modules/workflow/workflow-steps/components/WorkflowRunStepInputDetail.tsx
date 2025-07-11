import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { WorkflowRunStepJsonContainer } from '@/workflow/workflow-steps/components/WorkflowRunStepJsonContainer';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { getWorkflowPreviousStepId } from '@/workflow/workflow-steps/utils/getWorkflowPreviousStepId';
import { getWorkflowRunStepContext } from '@/workflow/workflow-steps/utils/getWorkflowRunStepContext';
import { getWorkflowVariablesUsedInStep } from '@/workflow/workflow-steps/utils/getWorkflowVariablesUsedInStep';
import { getActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionHeaderTypeOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconBrackets, useIcons } from 'twenty-ui/display';
import {
  GetJsonNodeHighlighting,
  JsonNestedNode,
  JsonTreeContextProvider,
  ShouldExpandNodeInitiallyProps,
} from 'twenty-ui/json-visualizer';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { JsonValue } from 'type-fest';

export const WorkflowRunStepInputDetail = ({ stepId }: { stepId: string }) => {
  const { t, i18n } = useLingui();
  const { getIcon } = useIcons();
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();

  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });
  const step = workflowRun?.state?.flow.steps.find(
    (step) => step.id === stepId,
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

  const previousStepId = getWorkflowPreviousStepId({
    stepId,
    steps: workflowRun.state.flow.steps,
  });

  if (previousStepId === undefined) {
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

  const headerTitle = stepDefinition.definition.name;
  const headerIcon = getActionIcon(stepDefinition.definition.type);
  const headerIconColor = getActionIconColorOrThrow({
    theme,
    actionType: stepDefinition.definition.type,
  });
  const headerType = getActionHeaderTypeOrThrow(stepDefinition.definition.type);

  const variablesUsedInStep = getWorkflowVariablesUsedInStep({
    step,
  });
  const allVariablesUsedInStep = Array.from(variablesUsedInStep);

  const stepContext = getWorkflowRunStepContext({
    stepInfos: workflowRun.state.stepInfos,
    flow: workflowRun.state.flow,
    stepId,
  });

  if (stepContext.length === 0) {
    throw new Error('The input tab must be rendered with a non-empty context.');
  }

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
      <WorkflowStepHeader
        disabled
        Icon={getIcon(headerIcon)}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={i18n._(headerType)}
      />

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
