import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { workflowRunStepLogSchema } from 'twenty-shared/workflow';
import { IconInfoCircle } from 'twenty-ui/display';
import { isTwoFirstDepths, JsonTree } from 'twenty-ui/json-visualizer';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type JsonValue } from 'type-fest';

import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import { useWorkflowRunStepLog } from '@/workflow/hooks/useWorkflowRunStepLog';
import { WorkflowRunStepLogsAiAgentDetail } from '@/workflow/workflow-run/observability/WorkflowRunStepLogsAiAgentDetail';
import { WorkflowRunStepLogsCodeDetail } from '@/workflow/workflow-run/observability/WorkflowRunStepLogsCodeDetail';
import { WorkflowRunStepLogsEmailDetail } from '@/workflow/workflow-run/observability/WorkflowRunStepLogsEmailDetail';
import { WorkflowRunStepLogsEntries } from '@/workflow/workflow-run/observability/WorkflowRunStepLogsEntries';
import { WorkflowRunStepLogsHttpRequestDetail } from '@/workflow/workflow-run/observability/WorkflowRunStepLogsHttpRequestDetail';
import { getIsDescendantOfIterator } from '@/workflow/workflow-steps/utils/getIsDescendantOfIterator';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledRoot = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  overflow: hidden scroll;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[3]};
  text-align: center;
`;

const StyledTruncatedNotice = styled.div`
  background: ${themeCssVariables.background.transparent.orange};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

export const WorkflowRunStepLogsDetail = ({ stepId }: { stepId: string }) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const workflowRunId = useWorkflowRunIdOrThrow();
  const flow = useFlowOrThrow();

  const rawStepLog = useWorkflowRunStepLog({ workflowRunId, stepId });

  if (!isDefined(rawStepLog)) {
    return (
      <StyledRoot>
        <StyledEmptyState>
          <IconInfoCircle size={20} />
          <div>{t`No logs were recorded for this step.`}</div>
        </StyledEmptyState>
      </StyledRoot>
    );
  }

  const parseResult = workflowRunStepLogSchema.safeParse(rawStepLog);

  if (!parseResult.success) {
    return (
      <StyledRoot>
        <JsonTree
          value={rawStepLog as JsonValue}
          shouldExpandNodeInitially={isTwoFirstDepths}
          emptyArrayLabel={t`Empty Array`}
          emptyObjectLabel={t`Empty Object`}
          emptyStringLabel={t`[empty string]`}
          arrowButtonCollapsedLabel={t`Expand`}
          arrowButtonExpandedLabel={t`Collapse`}
          onNodeValueClick={copyToClipboard}
        />
      </StyledRoot>
    );
  }

  const stepLog = parseResult.data;

  const isInsideIteratorLoop = isDefined(flow.steps)
    ? getIsDescendantOfIterator({ stepId, steps: flow.steps })
    : false;

  const renderDetails = () => {
    switch (stepLog.details.type) {
      case 'AI_AGENT':
        return <WorkflowRunStepLogsAiAgentDetail details={stepLog.details} />;
      case 'CODE':
        return <WorkflowRunStepLogsCodeDetail details={stepLog.details} />;
      case 'HTTP_REQUEST':
        return (
          <WorkflowRunStepLogsHttpRequestDetail details={stepLog.details} />
        );
      case 'EMAIL':
        return <WorkflowRunStepLogsEmailDetail details={stepLog.details} />;
      default:
        return (
          <JsonTree
            value={stepLog.details as JsonValue}
            shouldExpandNodeInitially={isTwoFirstDepths}
            emptyArrayLabel={t`Empty Array`}
            emptyObjectLabel={t`Empty Object`}
            emptyStringLabel={t`[empty string]`}
            arrowButtonCollapsedLabel={t`Expand`}
            arrowButtonExpandedLabel={t`Collapse`}
            onNodeValueClick={copyToClipboard}
          />
        );
    }
  };

  return (
    <StyledRoot>
      {renderDetails()}

      <WorkflowRunStepLogsEntries
        entries={stepLog.entries}
        onlyLatestIteration={isInsideIteratorLoop}
      />

      {isDefined(stepLog.truncated) && (
        <StyledTruncatedNotice>
          {t`Some log data was dropped to fit the size limit (${stepLog.truncated.droppedEntries} entries, ${stepLog.truncated.droppedBytes} bytes).`}
        </StyledTruncatedNotice>
      )}
    </StyledRoot>
  );
};
