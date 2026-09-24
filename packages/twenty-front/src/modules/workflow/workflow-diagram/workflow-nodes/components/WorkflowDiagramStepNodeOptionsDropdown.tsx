import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownRootContent } from '@/ui/layout/dropdown/components/DropdownRootContent';
import { DROPDOWN_OFFSET_Y } from '@/ui/layout/dropdown/constants/DropdownOffsetY';
import { OPTIONS_DROPDOWN_GLOBAL_HOTKEYS_CONFIG } from '@/ui/layout/dropdown/constants/OptionsDropdownGlobalHotkeysConfig';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { WorkflowStepOptionsMenuItems } from '@/workflow/workflow-steps/components/WorkflowStepOptionsMenuItems';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { Dropdown, IconButton } from 'twenty-ui/components';
import { IconDotsVertical } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOptionsButtonContainer = styled.div`
  align-items: center;
  bottom: 0;
  display: flex;
  position: absolute;
  right: calc(0px - ${themeCssVariables.spacing[4]});
  top: 0;
  transform: translateX(100%);
`;

export const WorkflowDiagramStepNodeOptionsDropdown = ({
  onChangeNode,
  onDuplicateNode,
  onDelete,
}: {
  onChangeNode: () => void;
  onDuplicateNode?: () => void;
  onDelete: () => void;
}) => {
  const { t } = useLingui();
  const dropdownId = useId();

  return (
    <StyledOptionsButtonContainer className="nodrag nopan">
      <ParentClickOutsideIdContext.Provider
        value={WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID}
      >
        <DropdownRoot
          dropdownId={dropdownId}
          type="menu"
          globalHotkeysConfig={OPTIONS_DROPDOWN_GLOBAL_HOTKEYS_CONFIG}
        >
          <Dropdown.Trigger
            data-select-disable
            render={
              <IconButton elevated size="md" aria-label={t`Node options`}>
                <IconDotsVertical />
              </IconButton>
            }
          />
          <DropdownRootContent
            side="right"
            align="start"
            sideOffset={DROPDOWN_OFFSET_Y}
          >
            <Dropdown.Section>
              <WorkflowStepOptionsMenuItems
                changeNodeText={t`Change node`}
                onChangeNode={onChangeNode}
                onDuplicateNode={onDuplicateNode}
                onDeleteNode={onDelete}
              />
            </Dropdown.Section>
          </DropdownRootContent>
        </DropdownRoot>
      </ParentClickOutsideIdContext.Provider>
    </StyledOptionsButtonContainer>
  );
};
