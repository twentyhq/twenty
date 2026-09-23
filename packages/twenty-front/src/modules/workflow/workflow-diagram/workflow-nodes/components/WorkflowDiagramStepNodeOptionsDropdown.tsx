import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
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
      <DropdownRoot
        dropdownId={dropdownId}
        type="menu"
        globalHotkeysConfig={{ enableGlobalHotkeysWithModifiers: true }}
      >
        <Dropdown.Trigger
          data-select-disable
          render={
            <IconButton elevated size="md" aria-label={t`Node options`}>
              <IconDotsVertical />
            </IconButton>
          }
        />
        <Dropdown.Content
          side="right"
          align="start"
          sideOffset={8}
          data-click-outside-id={
            WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID
          }
        >
          <Dropdown.Section>
            <WorkflowStepOptionsMenuItems
              changeNodeText={t`Change node`}
              onChangeNode={onChangeNode}
              onDuplicateNode={onDuplicateNode}
              onDeleteNode={onDelete}
            />
          </Dropdown.Section>
        </Dropdown.Content>
      </DropdownRoot>
    </StyledOptionsButtonContainer>
  );
};
