import { useWorkflowRun } from '@/workflow/hooks/useWorkflowRun';
import { useWorkflowRunIdOrThrow } from '@/workflow/hooks/useWorkflowRunIdOrThrow';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared';
import { isTwoFirstDepths, JsonTree } from 'twenty-ui';

const StyledContainer = styled.div`
  display: grid;
  overflow-x: auto;
  padding-block: ${({ theme }) => theme.spacing(4)};
  padding-inline: ${({ theme }) => theme.spacing(3)};
`;

export const WorkflowRunStepOutputDetail = ({ stepId }: { stepId: string }) => {
  const workflowRunId = useWorkflowRunIdOrThrow();
  const workflowRun = useWorkflowRun({ workflowRunId });

  const { t } = useLingui();

  if (!isDefined(workflowRun?.output?.stepsOutput)) {
    return null;
  }

  const stepOutput = workflowRun.output.stepsOutput[stepId];

  return (
    <StyledContainer>
      <JsonTree
        value={stepOutput}
        shouldExpandNodeInitially={isTwoFirstDepths}
        emptyArrayLabel={t`Empty Array`}
        emptyObjectLabel={t`Empty Object`}
        emptyStringLabel={t`[empty string]`}
        arrowButtonCollapsedLabel={t`Expand`}
        arrowButtonExpandedLabel={t`Collapse`}
      />
    </StyledContainer>
  );
};
