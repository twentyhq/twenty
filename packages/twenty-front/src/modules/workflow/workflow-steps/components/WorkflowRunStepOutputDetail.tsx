import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { WorkflowRunStepJsonContainer } from '@/workflow/workflow-steps/components/WorkflowRunStepJsonContainer';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { getActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionHeaderTypeOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  GetJsonNodeHighlighting,
  isTwoFirstDepths,
  JsonTree,
  useIcons,
} from 'twenty-ui';

export const WorkflowRunStepOutputDetail = ({ stepId }: { stepId: string }) => {
  const { t, i18n } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();

  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });

  if (!isDefined(workflowRun?.output?.stepsOutput)) {
    return null;
  }

  const stepOutput = workflowRun.output.stepsOutput[stepId];

  const stepDefinition = getStepDefinitionOrThrow({
    stepId,
    trigger: workflowRun.output.flow.trigger,
    steps: workflowRun.output.flow.steps,
  });
  if (stepDefinition?.type !== 'action') {
    throw new Error('The output tab must be rendered with an action step.');
  }

  const headerTitle = stepDefinition.definition.name;
  const headerIcon = getActionIcon(stepDefinition.definition.type);
  const headerIconColor = getActionIconColorOrThrow({
    theme,
    actionType: stepDefinition.definition.type,
  });
  const headerType = getActionHeaderTypeOrThrow(stepDefinition.definition.type);

  const setRedHighlightingForEveryNode: GetJsonNodeHighlighting = () => 'red';

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
        <JsonTree
          value={stepOutput}
          shouldExpandNodeInitially={isTwoFirstDepths}
          emptyArrayLabel={t`Empty Array`}
          emptyObjectLabel={t`Empty Object`}
          emptyStringLabel={t`[empty string]`}
          arrowButtonCollapsedLabel={t`Expand`}
          arrowButtonExpandedLabel={t`Collapse`}
          getNodeHighlighting={
            isDefined(stepOutput.error)
              ? setRedHighlightingForEveryNode
              : undefined
          }
        />
      </WorkflowRunStepJsonContainer>
    </>
  );
};
