import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WorkflowRunDiagramBaseEdge } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramBaseEdge';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useOpenWorkflowRunFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowRunFilterInCommandMenu';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { WorkflowDiagramNodeVariant } from '@/workflow/workflow-diagram/types/WorkflowDiagramNodeVariant';
import { getNodeVariantFromStepRunStatus } from '@/workflow/workflow-diagram/utils/getNodeVariantFromStepRunStatus';
import { getWorkflowDiagramNodeSelectedColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramNodeSelectedColors';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';

type WorkflowDiagramFilterEdgeRunProps = EdgeProps<WorkflowDiagramEdge>;

const assertFilterEdgeDataOrThrow: (
  data: WorkflowDiagramEdgeData | undefined,
) => asserts data is WorkflowDiagramEdgeData & { edgeType: 'filter' } = (
  data: WorkflowDiagramEdgeData | undefined,
) => {
  if (data?.edgeType !== 'filter') {
    throw new Error('Edge data must be of type "filter"');
  }
};

const StyledIconButtonGroup = styled(IconButtonGroup)<{
  selected?: boolean;
  variant: WorkflowDiagramNodeVariant;
}>`
  pointer-events: all;

  ${({ selected, variant, theme }) => {
    if (!selected) return '';
    const colors = getWorkflowDiagramNodeSelectedColors(variant, theme);
    return css`
      background-color: ${colors.background};
      border: 1px solid ${colors.borderColor};
    `;
  }}
`;

const StyledConfiguredFilterContainer = styled.div`
  height: 26px;
  width: 26px;
`;

export const WorkflowDiagramFilterEdgeRun = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: WorkflowDiagramFilterEdgeRunProps) => {
  assertFilterEdgeDataOrThrow(data);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const workflowSelectedNode = useRecoilComponentValue(
    workflowSelectedNodeComponentState,
  );

  const isFilterNodeSelected =
    isNonEmptyString(data.stepId) && workflowSelectedNode === data.stepId;

  const { openWorkflowRunFilterInCommandMenu } =
    useOpenWorkflowRunFilterInCommandMenu();

  const handleFilterButtonClick = () => {
    if (!isDefined(data.runStatus)) {
      throw new Error('Run status must be set on edge data for workflow runs');
    }

    openWorkflowRunFilterInCommandMenu({
      stepId: data.stepId,
      stepName: data.name,
      stepExecutionStatus: data.runStatus,
    });
  };

  return (
    <>
      <WorkflowRunDiagramBaseEdge
        edgePath={edgePath}
        edgeExecutionStatus={data.edgeExecutionStatus}
      />

      <EdgeLabelRenderer>
        <WorkflowDiagramEdgeV2Container
          data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
          labelX={labelX}
          labelY={labelY}
        >
          <WorkflowDiagramEdgeV2VisibilityContainer shouldDisplay>
            <StyledConfiguredFilterContainer>
              <StyledIconButtonGroup
                className="nodrag nopan"
                iconButtons={[
                  {
                    Icon: IconFilter,
                    onClick: handleFilterButtonClick,
                  },
                ]}
                selected={isFilterNodeSelected}
                variant={getNodeVariantFromStepRunStatus(data.runStatus)}
              />
            </StyledConfiguredFilterContainer>
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
