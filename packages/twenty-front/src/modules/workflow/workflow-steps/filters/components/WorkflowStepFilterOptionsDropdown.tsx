import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { useRemoveStepFilter } from '@/workflow/workflow-steps/filters/hooks/useRemoveStepFilter';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { useContext } from 'react';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';

type WorkflowStepFilterOptionsDropdownProps = {
  stepFilterId: string;
};

export const WorkflowStepFilterOptionsDropdown = ({
  stepFilterId,
}: WorkflowStepFilterOptionsDropdownProps) => {
  const { readonly } = useContext(WorkflowStepFilterContext);

  const { removeStepFilter } = useRemoveStepFilter();

  return (
    <DropdownRoot
      dropdownId={`step-filter-options-${stepFilterId}`}
      type="menu"
    >
      <Dropdown.Trigger
        disabled={readonly}
        render={
          <IconButton
            aria-label={t`Step filter options`}
            variant="ghost"
            disabled={readonly}
          >
            <IconDotsVertical />
          </IconButton>
        }
      />
      <DropdownContent
        align="start"
        sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
      >
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconTrash />}
            onClick={() => removeStepFilter(stepFilterId)}
            color="danger"
          >
            {t`Delete`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
