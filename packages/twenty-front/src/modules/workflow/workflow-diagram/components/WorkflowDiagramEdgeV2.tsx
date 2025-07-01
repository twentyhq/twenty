import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentStateV2 } from '@/ui/layout/dropdown/states/isDropdownOpenComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { workflowDiagramPanOnDragComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramPanOnDragComponentState';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  IconDotsVertical,
  IconFilter,
  IconFilterPlus,
  IconFilterX,
  IconGitBranchDeleted,
  IconPlus,
} from 'twenty-ui/display';
import { IconButtonGroup } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

const StyledIconButtonGroup = styled(IconButtonGroup)`
  pointer-events: all;
`;

const StyledContainer = styled.div<{ labelX: number; labelY: number }>`
  padding: ${({ theme }) => theme.spacing(1)};
  pointer-events: all;
  ${({ labelX, labelY }) => css`
    transform: translate(-50%, -50%) translate(${labelX}px, ${labelY}px);
  `}
  position: absolute;
`;

const StyledOpacityOverlay = styled.div<{ shouldDisplay: boolean }>`
  opacity: ${({ shouldDisplay }) => (shouldDisplay ? 1 : 0)};
  position: relative;
`;

type WorkflowDiagramEdgeV2Props = {
  labelX: number;
  labelY: number;
  parentStepId: string;
  nextStepId: string;
};

export const WorkflowDiagramEdgeV2 = ({
  labelX,
  labelY,
  parentStepId,
  nextStepId,
}: WorkflowDiagramEdgeV2Props) => {
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();
  const { startNodeCreation } = useStartNodeCreation();

  const [hovered, setHovered] = useState(false);

  const setWorkflowDiagramPanOnDrag = useSetRecoilComponentStateV2(
    workflowDiagramPanOnDragComponentState,
  );

  const workflowInsertStepIds = useRecoilComponentValueV2(
    workflowInsertStepIdsComponentState,
  );

  const isSelected =
    workflowInsertStepIds.parentStepId === parentStepId &&
    workflowInsertStepIds.nextStepId === nextStepId;

  const dropdownId = `${WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}-${parentStepId}-${nextStepId}`;

  const isDropdownOpen = useRecoilComponentValueV2(
    isDropdownOpenComponentStateV2,
    dropdownId,
  );

  return (
    <StyledContainer
      data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
      labelX={labelX}
      labelY={labelY}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <StyledOpacityOverlay
        shouldDisplay={isSelected || hovered || isDropdownOpen}
      >
        <StyledIconButtonGroup
          className="nodrag nopan"
          iconButtons={[
            {
              Icon: IconFilterPlus,
              onClick: () => {},
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

        <Dropdown
          dropdownId={dropdownId}
          clickableComponent={<div></div>}
          data-select-disable
          dropdownPlacement="bottom-start"
          dropdownStrategy="absolute"
          dropdownOffset={{
            x: 0,
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
                  onClick={() => {}}
                />
                <MenuItem
                  text="Remove Filter"
                  LeftIcon={IconFilterX}
                  onClick={() => {}}
                />
                <MenuItem
                  text="Add Node"
                  LeftIcon={IconPlus}
                  onClick={() => {
                    closeDropdown(dropdownId);
                    setHovered(false);

                    startNodeCreation({ parentStepId, nextStepId });
                  }}
                />
                <MenuItem
                  text="Delete branch"
                  LeftIcon={IconGitBranchDeleted}
                  onClick={() => {}}
                />
              </DropdownMenuItemsContainer>
            </DropdownContent>
          }
        />
      </StyledOpacityOverlay>
    </StyledContainer>
  );
};
