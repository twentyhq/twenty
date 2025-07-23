import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WorkflowRunDiagramBaseEdge } from '@/workflow/workflow-diagram/components/WorkflowRunDiagramBaseEdge';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useOpenWorkflowRunFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowRunFilterInCommandMenu';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import styled from '@emotion/styled';
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

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
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
              />
            </StyledConfiguredFilterContainer>
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
