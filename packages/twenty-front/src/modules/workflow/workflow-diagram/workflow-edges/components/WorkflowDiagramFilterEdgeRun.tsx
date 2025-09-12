import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import type { WorkflowRunStepStatus } from '@/workflow/types/Workflow';
import { useOpenWorkflowRunFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowRunFilterInCommandMenu';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowDiagramEdgeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WorkflowRunDiagramBaseEdge } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowRunDiagramBaseEdge';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { WorkflowStepFilterCounter } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterCounter';
import { useFilterCounter } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useFilterCounter';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';

type WorkflowDiagramFilterEdgeRunProps = WorkflowDiagramEdgeComponentProps;

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
  runStatus?: WorkflowRunStepStatus;
}>`
  pointer-events: all;

  ${({ selected, runStatus, theme }) => {
    if (!selected) return '';
    const colors = getWorkflowDiagramColors({ runStatus, theme });
    return css`
      background-color: ${colors.selected.background};
      border: 1px solid ${colors.selected.borderColor};
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
  markerStart,
  markerEnd,
}: WorkflowDiagramFilterEdgeRunProps) => {
  assertFilterEdgeDataOrThrow(data);

  const theme = useTheme();

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

  const { filterCounter } = useFilterCounter({ stepId: data.stepId });
  const { selected } = getWorkflowDiagramColors({
    theme,
    runStatus: data.runStatus,
  });

  return (
    <>
      <WorkflowRunDiagramBaseEdge
        path={edgePath}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        <WorkflowDiagramEdgeV2Container
          data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
          labelX={labelX}
          labelY={labelY}
        >
          <WorkflowDiagramEdgeV2VisibilityContainer shouldDisplay>
            <StyledConfiguredFilterContainer>
              <WorkflowStepFilterCounter
                backgroundColor={selected.tagBackground}
                textColor={selected.color}
                counter={filterCounter}
              />
              <StyledIconButtonGroup
                className="nodrag nopan"
                iconButtons={[
                  {
                    Icon: IconFilter,
                    onClick: handleFilterButtonClick,
                  },
                ]}
                selected={isFilterNodeSelected}
                runStatus={data.runStatus}
              />
            </StyledConfiguredFilterContainer>
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
