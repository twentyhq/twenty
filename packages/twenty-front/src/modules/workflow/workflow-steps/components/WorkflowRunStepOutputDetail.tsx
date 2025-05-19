import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { WorkflowExecutorOutput } from '@/workflow/types/Workflow';
import { getStepDefinitionOrThrow } from '@/workflow/utils/getStepDefinitionOrThrow';
import { WorkflowRunStepJsonContainer } from '@/workflow/workflow-steps/components/WorkflowRunStepJsonContainer';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { getActionHeaderTypeOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionHeaderTypeOrThrow';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { getTriggerHeaderType } from '@/workflow/workflow-trigger/utils/getTriggerHeaderType';
import { getTriggerIcon } from '@/workflow/workflow-trigger/utils/getTriggerIcon';
import { getTriggerIconColor } from '@/workflow/workflow-trigger/utils/getTriggerIconColor';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import {
  GetJsonNodeHighlighting,
  isTwoFirstDepths,
  JsonTree,
} from 'twenty-ui/json-visualizer';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const WorkflowRunStepOutputDetail = ({ stepId }: { stepId: string }) => {
  const { t, i18n } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { copyToClipboard } = useCopyToClipboard();

  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });

  if (!isDefined(workflowRun?.output?.stepsOutput)) {
    return null;
  }

  const stepOutput = workflowRun.output.stepsOutput[stepId] as
    | WorkflowExecutorOutput
    | undefined;

  const stepDefinition = getStepDefinitionOrThrow({
    stepId,
    trigger: workflowRun.output.flow.trigger,
    steps: workflowRun.output.flow.steps,
  });
  if (
    !isDefined(stepDefinition?.definition) ||
    !isDefined(stepDefinition.definition.name)
  ) {
    throw new Error('The step is expected to be properly shaped.');
  }

  const headerTitle = stepDefinition.definition.name;
  const headerIcon =
    stepDefinition.type === 'trigger'
      ? getTriggerIcon(stepDefinition.definition)
      : getActionIcon(stepDefinition.definition.type);
  const headerIconColor =
    stepDefinition.type === 'trigger'
      ? getTriggerIconColor({ theme })
      : getActionIconColorOrThrow({
          theme,
          actionType: stepDefinition.definition.type,
        });
  const headerType =
    stepDefinition.type === 'trigger'
      ? getTriggerHeaderType(stepDefinition.definition)
      : i18n._(getActionHeaderTypeOrThrow(stepDefinition.definition.type));

  const setRedHighlightingForEveryNode: GetJsonNodeHighlighting = () => 'red';

  return (
    <>
      <WorkflowStepHeader
        disabled
        Icon={getIcon(headerIcon)}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
      />

      <WorkflowRunStepJsonContainer>
        <JsonTree
          value={stepOutput ?? t`No output available`}
          shouldExpandNodeInitially={isTwoFirstDepths}
          emptyArrayLabel={t`Empty Array`}
          emptyObjectLabel={t`Empty Object`}
          emptyStringLabel={t`[empty string]`}
          arrowButtonCollapsedLabel={t`Expand`}
          arrowButtonExpandedLabel={t`Collapse`}
          getNodeHighlighting={
            isDefined(stepOutput?.error)
              ? setRedHighlightingForEveryNode
              : undefined
          }
          onNodeValueClick={copyToClipboard}
        />
      </WorkflowRunStepJsonContainer>
    </>
  );
};
