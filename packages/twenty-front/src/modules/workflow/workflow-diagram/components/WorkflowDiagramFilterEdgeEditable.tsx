import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramBaseEdge } from '@/workflow/workflow-diagram/components/WorkflowDiagramBaseEdge';
import { WorkflowDiagramEdgeButtonGroup } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeButtonGroup';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useEdgeHovered } from '@/workflow/workflow-diagram/hooks/useEdgeHovered';
import { useOpenWorkflowEditFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowEditFilterInCommandMenu';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { workflowDiagramPanOnDragComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramPanOnDragComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getWorkflowDiagramNodeSelectedColors } from '@/workflow/workflow-diagram/utils/getWorkflowDiagramNodeSelectedColors';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  IconDotsVertical,
  IconFilter,
  IconFilterX,
  IconPlus,
} from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type WorkflowDiagramFilterEdgeEditableProps = EdgeProps<WorkflowDiagramEdge>;

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
    const colors = getWorkflowDiagramNodeSelectedColors('default', theme);
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

export const WorkflowDiagramFilterEdgeEditable = ({
  id,
  source,
  target,
  sourceY,
  sourceX,
  targetY,
  targetX,
  markerStart,
  markerEnd,
  data,
}: WorkflowDiagramFilterEdgeEditableProps) => {
  assertFilterEdgeDataOrThrow(data);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const workflowVisualizerWorkflowId = useRecoilComponentValue(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);
  const { isInRightDrawer } = useContext(ActionMenuContext);

  const { deleteStep } = useDeleteStep({ workflow });
  const { startNodeCreation, isNodeCreationStarted } = useStartNodeCreation();

  const setCommandMenuNavigationStack = useSetRecoilState(
    commandMenuNavigationStackState,
  );

  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const { isEdgeHovered } = useEdgeHovered();

  const setWorkflowDiagramPanOnDrag = useSetRecoilComponentState(
    workflowDiagramPanOnDragComponentState,
  );

  const nodeCreationStarted = isNodeCreationStarted({
    parentStepId: data.stepId,
    nextStepId: target,
  });

  const workflowSelectedNode = useRecoilComponentValue(
    workflowSelectedNodeComponentState,
  );

  const isFilterNodeSelected =
    isNonEmptyString(data.stepId) && workflowSelectedNode === data.stepId;

  const dropdownId = `${WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}-${source}-${target}`;

  const isDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { openWorkflowEditFilterInCommandMenu } =
    useOpenWorkflowEditFilterInCommandMenu();

  const handleFilterButtonClick = () => {
    if (!isInRightDrawer) {
      setCommandMenuNavigationStack([]);
    }

    openWorkflowEditFilterInCommandMenu({
      stepId: data.stepId,
      stepName: data.name,
    });
  };

  const handleAddNodeButtonClick = () => {
    closeDropdown(dropdownId);

    startNodeCreation({
      parentStepId: data.stepId,
      nextStepId: target,
      position: { x: labelX, y: labelY },
    });
  };

  return (
    <>
      <WorkflowDiagramBaseEdge
        source={source}
        target={target}
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
              {isEdgeHovered(id) || isDropdownOpen || nodeCreationStarted ? (
                <WorkflowDiagramEdgeButtonGroup
                  iconButtons={[
                    {
                      Icon: IconFilter,
                      onClick: handleFilterButtonClick,
                    },
                    {
                      Icon: IconDotsVertical,
                      onClick: () => {
                        openDropdown({
                          dropdownComponentInstanceIdFromProps: dropdownId,
                        });
                      },
                    },
                  ]}
                  selected={isFilterNodeSelected}
                />
              ) : (
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
              )}
            </StyledConfiguredFilterContainer>

            <Dropdown
              dropdownId={dropdownId}
              clickableComponent={<div></div>}
              data-select-disable
              dropdownPlacement="bottom-start"
              dropdownStrategy="absolute"
              dropdownOffset={{
                x: 24,
                y: 4,
              }}
              onOpen={() => {
                setWorkflowDiagramPanOnDrag(false);
              }}
              onClose={() => {
                setWorkflowDiagramPanOnDrag(true);
              }}
              dropdownComponents={
                <DropdownContent
                  widthInPixels={GenericDropdownContentWidth.Narrow}
                >
                  <DropdownMenuItemsContainer>
                    <MenuItem
                      text="Filter"
                      LeftIcon={IconFilter}
                      onClick={() => {
                        closeDropdown(dropdownId);

                        handleFilterButtonClick();
                      }}
                    />
                    <MenuItem
                      text="Remove Filter"
                      LeftIcon={IconFilterX}
                      onClick={() => {
                        closeDropdown(dropdownId);

                        if (!isDefined(data.stepId)) {
                          throw new Error(
                            'Step ID must be configured for the edge when rendering a filter',
                          );
                        }

                        return deleteStep(data.stepId);
                      }}
                    />
                    <MenuItem
                      text="Add Node"
                      LeftIcon={IconPlus}
                      onClick={handleAddNodeButtonClick}
                    />
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          </WorkflowDiagramEdgeV2VisibilityContainer>
        </WorkflowDiagramEdgeV2Container>
      </EdgeLabelRenderer>
    </>
  );
};
