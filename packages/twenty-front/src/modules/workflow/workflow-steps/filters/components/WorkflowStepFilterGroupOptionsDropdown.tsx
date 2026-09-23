import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useRemoveStepFilterGroup } from '@/workflow/workflow-steps/filters/hooks/useRemoveStepFilterGroup';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { useContext } from 'react';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { Dropdown, IconButton } from 'twenty-ui/components';

type WorkflowStepFilterGroupOptionsDropdownProps = {
  stepFilterGroupId: string;
};

export const WorkflowStepFilterGroupOptionsDropdown = ({
  stepFilterGroupId,
}: WorkflowStepFilterGroupOptionsDropdownProps) => {
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { removeStepFilterGroup } = useRemoveStepFilterGroup();

  return (
    <DropdownRoot
      dropdownId={`step-filter-group-options-${stepFilterGroupId}`}
      type="menu"
    >
      <Dropdown.Trigger
        disabled={readonly}
        render={
          <IconButton
            aria-label={t`Step filter group options`}
            variant="ghost"
            disabled={readonly}
          >
            <IconDotsVertical />
          </IconButton>
        }
      />
      <Dropdown.Content
        data-click-outside-id={parentClickOutsideId}
        align="end"
        sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET.y}
      >
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconTrash />}
            onClick={() => removeStepFilterGroup(stepFilterGroupId)}
            color="danger"
          >
            {t`Delete group`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </DropdownRoot>
  );
};
