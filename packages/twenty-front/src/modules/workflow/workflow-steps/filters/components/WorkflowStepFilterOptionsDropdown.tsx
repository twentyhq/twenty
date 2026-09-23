import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useRemoveStepFilter } from '@/workflow/workflow-steps/filters/hooks/useRemoveStepFilter';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { useContext } from 'react';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { Dropdown, IconButton } from 'twenty-ui/components';

const FILTER_MENU_SIDE_OFFSET = 2;

type WorkflowStepFilterOptionsDropdownProps = {
  stepFilterId: string;
};

export const WorkflowStepFilterOptionsDropdown = ({
  stepFilterId,
}: WorkflowStepFilterOptionsDropdownProps) => {
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);
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
      <Dropdown.Content
        data-click-outside-id={parentClickOutsideId}
        align="start"
        sideOffset={FILTER_MENU_SIDE_OFFSET}
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
      </Dropdown.Content>
    </DropdownRoot>
  );
};
