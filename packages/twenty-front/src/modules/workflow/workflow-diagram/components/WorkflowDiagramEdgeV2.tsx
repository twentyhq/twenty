import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentStateV2 } from '@/ui/layout/dropdown/states/isDropdownOpenComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useStartNodeCreation } from '@/workflow/workflow-diagram/hooks/useStartNodeCreation';
import { workflowDiagramPanOnDragComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramPanOnDragComponentState';
import { useCreateStep } from '@/workflow/workflow-steps/hooks/useCreateStep';
import { useDeleteStep } from '@/workflow/workflow-steps/hooks/useDeleteStep';
import { workflowInsertStepIdsComponentState } from '@/workflow/workflow-steps/states/workflowInsertStepIdsComponentState';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
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

const StyledRoundedIconButtonGroup = styled(IconButtonGroup)`
  border-radius: 50px;
  overflow: hidden;
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
  stepId: string;
  parentStepId: string;
  nextStepId: string;
  filter: Record<string, any> | undefined;
};

export const WorkflowDiagramEdgeV2 = ({
  labelX,
  labelY,
  stepId,
  parentStepId,
  nextStepId,
  filter,
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

  const workflowVisualizerWorkflowId = useRecoilComponentValueV2(
    workflowVisualizerWorkflowIdComponentState,
  );
  const workflow = useWorkflowWithCurrentVersion(workflowVisualizerWorkflowId);

  if (!workflow) {
    throw new Error();
  }

  const { createStep } = useCreateStep({ workflow });
  const { deleteStep } = useDeleteStep({ workflow });

  const handleCreateFilter = async () => {
    await createStep({
      newStepType: 'FILTER',
      parentStepId,
      nextStepId,
    });

    closeDropdown(dropdownId);
    setHovered(false);
  };

  return (
    <StyledContainer
      data-click-outside-id={WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID}
      labelX={labelX}
      labelY={labelY}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <StyledOpacityOverlay
        shouldDisplay={
          isSelected || hovered || isDropdownOpen || isDefined(filter)
        }
      >
        {isDefined(filter) && !hovered && !isDropdownOpen && !isSelected ? (
          <StyledRoundedIconButtonGroup
            className="nodrag nopan"
            iconButtons={[
              {
                Icon: IconFilterPlus,
              },
            ]}
          />
        ) : (
          <StyledIconButtonGroup
            className="nodrag nopan"
            iconButtons={[
              {
                Icon: IconFilterPlus,
                onClick: () => {
                  handleCreateFilter();
                },
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
        )}

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
                  onClick={() => {
                    closeDropdown(dropdownId);
                    setHovered(false);

                    deleteStep(stepId);
                  }}
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
