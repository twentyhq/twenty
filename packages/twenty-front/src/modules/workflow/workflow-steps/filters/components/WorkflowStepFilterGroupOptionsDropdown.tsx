import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRemoveStepFilterGroup } from '@/workflow/workflow-steps/filters/hooks/useRemoveStepFilterGroup';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { useContext } from 'react';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
          variant="ghost"
          disabled={readonly}
        >
          <IconDotsVertical />
        </IconButton>
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <ListItem
              startIcon={<IconTrash />}
              onClick={getDropdownMenuItemClickHandler(() =>
                removeStepFilterGroup(stepFilterGroupId),
              )}
              color="danger"
            >
              <OverflowingTextWithTooltip text={t`Delete group`} />
            </ListItem>
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
    />
  );
};
