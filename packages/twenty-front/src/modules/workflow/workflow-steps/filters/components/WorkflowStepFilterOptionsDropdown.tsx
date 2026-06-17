import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRemoveStepFilter } from '@/workflow/workflow-steps/filters/hooks/useRemoveStepFilter';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { useContext } from 'react';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type WorkflowStepFilterOptionsDropdownProps = {
  stepFilterId: string;
};

export const WorkflowStepFilterOptionsDropdown = ({
  stepFilterId,
}: WorkflowStepFilterOptionsDropdownProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { removeStepFilter } = useRemoveStepFilter();

  return (
    <Dropdown
      dropdownId={`step-filter-options-${stepFilterId}`}
      clickableComponent={
        <IconButton
          aria-label={t`Step filter options`}
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
              text={t`Delete`}
              onClick={() => removeStepFilter(stepFilterId)}
              accent="danger"
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
      dropdownPlacement="bottom-start"
    />
  );
};
