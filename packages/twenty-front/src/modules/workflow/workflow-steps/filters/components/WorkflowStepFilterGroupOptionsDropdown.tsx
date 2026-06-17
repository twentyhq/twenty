import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRemoveStepFilterGroup } from '@/workflow/workflow-steps/filters/hooks/useRemoveStepFilterGroup';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { useContext } from 'react';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type WorkflowStepFilterGroupOptionsDropdownProps = {
  stepFilterGroupId: string;
};

export const WorkflowStepFilterGroupOptionsDropdown = ({
  stepFilterGroupId,
}: WorkflowStepFilterGroupOptionsDropdownProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { removeStepFilterGroup } = useRemoveStepFilterGroup();

  return (
    <Dropdown
      dropdownId={`step-filter-group-options-${stepFilterGroupId}`}
      clickableComponent={
        <IconButton
          aria-label={t`Step filter group options`}
          variant="tertiary"
          Icon={IconDotsVertical}
          disabled={readonly}
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconTrash}
              text={t`Delete group`}
              onClick={() => removeStepFilterGroup(stepFilterGroupId)}
              accent="danger"
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
    />
  );
};
