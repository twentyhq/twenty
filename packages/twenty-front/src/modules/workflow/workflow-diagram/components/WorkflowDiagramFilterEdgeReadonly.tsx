import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useOpenWorkflowViewFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowViewFilterInCommandMenu';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { IconFilter } from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';

type WorkflowDiagramFilterEdgeReadonlyProps = EdgeProps<WorkflowDiagramEdge>;

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

export const WorkflowDiagramFilterEdgeReadonly = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerStart,
  markerEnd,
  data,
}: WorkflowDiagramFilterEdgeReadonlyProps) => {
  assertFilterEdgeDataOrThrow(data);

  const theme = useTheme();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { openWorkflowViewFilterInCommandMenu } =
    useOpenWorkflowViewFilterInCommandMenu();

  const handleFilterButtonClick = () => {
    openWorkflowViewFilterInCommandMenu({
      stepId: data.stepId,
      stepName: data.name,
    });
  };

  return (
    <>
      <BaseEdge
        markerStart={markerStart}
        markerEnd={markerEnd}
        path={edgePath}
        style={{ stroke: theme.border.color.strong }}
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
