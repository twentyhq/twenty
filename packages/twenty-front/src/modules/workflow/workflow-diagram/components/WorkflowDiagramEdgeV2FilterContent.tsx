import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WorkflowDiagramEdgeV2Container } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2Container';
import { WorkflowDiagramEdgeV2VisibilityContainer } from '@/workflow/workflow-diagram/components/WorkflowDiagramEdgeV2VisibilityContainer';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { workflowDiagramPanOnDragComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramPanOnDragComponentState';
import { workflowSelectedNodeComponentState } from '@/workflow/workflow-diagram/states/workflowSelectedNodeComponentState';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { FilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilter';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
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

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

const StyledConfiguredFilterContainer = styled.div`
  height: 26px;
  width: 26px;
`;

type WorkflowDiagramEdgeV2FilterContentProps = {
  labelX: number;
  labelY: number;
  stepId: string;
  parentStepId: string;
  nextStepId: string;
  filterSettings: FilterSettings;
  onDeleteFilter: () => Promise<void>;
  onCreateNode: () => void;
  isEdgeEditable: boolean;
};

export const WorkflowDiagramEdgeV2FilterContent = ({
  labelX,
  labelY,
  stepId,
  parentStepId,
  nextStepId,
  onDeleteFilter,
  onCreateNode,
  isEdgeEditable,
}: WorkflowDiagramEdgeV2FilterContentProps) => {
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
    workflowInsertStepIds.nextStepId === nextStepId &&
    (workflowInsertStepIds.parentStepId === parentStepId ||
      (isNonEmptyString(stepId) &&
        workflowInsertStepIds.parentStepId === stepId));

  const dropdownId = `${WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}-${parentStepId}-${nextStepId}`;

  const isDropdownOpen = useRecoilComponentValueV2(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );

  const { openWorkflowEditStepInCommandMenu } = useWorkflowCommandMenu();

  const setWorkflowSelectedNode = useSetRecoilComponentStateV2(
    workflowSelectedNodeComponentState,
  );

  const handleMouseEnter = () => {
    if (!isEdgeEditable) {
      return;
    }

    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleFilterButtonClick = () => {
    setWorkflowSelectedNode(stepId);

    if (isDefined(workflowVisualizerWorkflowId)) {
      openWorkflowEditStepInCommandMenu(
        workflowVisualizerWorkflowId,
        'Filter',
        IconFilter,
      );
    }
  };

  return (
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
            <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
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

                    onDeleteFilter();
                  }}
                />
                <MenuItem
                  text="Add Node"
                  LeftIcon={IconPlus}
                  onClick={() => {
                    closeDropdown(dropdownId);
                    setHovered(false);

                    onCreateNode();
                  }}
                />
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      </WorkflowDiagramEdgeV2VisibilityContainer>
    </WorkflowDiagramEdgeV2Container>
  );
};
