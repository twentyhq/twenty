import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useOpenWorkflowViewFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowViewFilterInCommandMenu';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { type WorkflowDiagramEdgeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramColors';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/workflow-edges/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { type WorkflowDiagramEdgeComponentProps } from '@/workflow/workflow-diagram/workflow-edges/types/WorkflowDiagramEdgeComponentProps';
import { WorkflowStepFilterCounter } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowStepFilterCounter';
import { useFilterCounter } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useFilterCounter';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { IconFilter } from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';

type WorkflowDiagramFilterEdgeReadonlyProps = WorkflowDiagramEdgeComponentProps;

const assertFilterEdgeDataOrThrow: (
  data: WorkflowDiagramEdgeData | undefined,
) => asserts data is WorkflowDiagramEdgeData & { edgeType: 'filter' } = (
  data: WorkflowDiagramEdgeData | undefined,
) => {
  if (data?.edgeType !== 'filter') {
    throw new Error('Edge data must be of type "filter"');
  }
};

const StyledIconButtonGroup = styled(IconButtonGroup)<{ selected?: boolean }>`
  pointer-events: all;

  ${({ selected, theme }) => {
    if (!selected) return '';
    const colors = getWorkflowDiagramColors({ theme });
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

  const { isInRightDrawer } = useContext(ActionMenuContext);

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

  const { openWorkflowViewFilterInCommandMenu } =
    useOpenWorkflowViewFilterInCommandMenu();

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const handleFilterButtonClick = () => {
    if (!isInRightDrawer) {
      setCommandMenuNavigationStack([]);
    }

    openWorkflowViewFilterInCommandMenu({
      stepId: data.stepId,
      stepName: data.name,
    });
  };

  const { filterCounter } = useFilterCounter({
    stepId: data.stepId,
  });
  const { unselected } = getWorkflowDiagramColors({ theme });

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
              <WorkflowStepFilterCounter
                backgroundColor={unselected.tagBackground}
                textColor={theme.font.color.inverted}
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
              />
            </StyledConfiguredFilterContainer>
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
