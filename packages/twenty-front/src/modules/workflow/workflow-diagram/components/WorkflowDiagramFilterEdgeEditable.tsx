import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useOpenWorkflowEditFilterInCommandMenu } from '@/workflow/workflow-diagram/hooks/useOpenWorkflowEditFilterInCommandMenu';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { workflowDiagramPanOnDragComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramPanOnDragComponentState';
import {
  WorkflowDiagramEdge,
  WorkflowDiagramEdgeData,
} from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { useState } from 'react';
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

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

const StyledConfiguredFilterContainer = styled.div`
  height: 26px;
  width: 26px;
`;

export const WorkflowDiagramFilterEdgeEditable = ({
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

  const theme = useTheme();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  const { deleteStep } = useDeleteStep({ workflow });
  const { startNodeCreation } = useStartNodeCreation();

  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const [hovered, setHovered] = useState(false);

  const setWorkflowDiagramPanOnDrag = useSetRecoilComponentStateV2(
    workflowDiagramPanOnDragComponentState,
  );

  const workflowInsertStepIds = useRecoilComponentValueV2(
    workflowInsertStepIdsComponentState,
  );

  const isSelected =
    workflowInsertStepIds.nextStepId === source &&
    (workflowInsertStepIds.parentStepId === target ||
      (isNonEmptyString(data.stepId) &&
        workflowInsertStepIds.parentStepId === data.stepId));

  const dropdownId = `${WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}-${source}-${target}`;

  const isDropdownOpen = useRecoilComponentValueV2(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const { openWorkflowEditFilterInCommandMenu } =
    useOpenWorkflowEditFilterInCommandMenu();

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleFilterButtonClick = () => {
    openWorkflowEditFilterInCommandMenu({
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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <WorkflowDiagramEdgeV2VisibilityContainer shouldDisplay>
            <StyledConfiguredFilterContainer>
              {hovered || isDropdownOpen || isSelected ? (
                <StyledIconButtonGroup
                  className="nodrag nopan"
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
                        setHovered(false);

                        handleFilterButtonClick();
                      }}
                    />
                    <MenuItem
                      text="Remove Filter"
                      LeftIcon={IconFilterX}
                      onClick={() => {
                        closeDropdown(dropdownId);
                        setHovered(false);

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
                      onClick={() => {
                        closeDropdown(dropdownId);
                        setHovered(false);

                        startNodeCreation({
                          parentStepId: data.stepId,
                          nextStepId: target,
                        });
                      }}
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
