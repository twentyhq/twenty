import { ActionButton } from '@/action-menu/actions/display/components/ActionButton';
import { getAdvancedFilterAddFilterRuleSelectDropdownId } from '@/object-record/advanced-filter/utils/getAdvancedFilterAddFilterRuleSelectDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useUpsertStepFilterSettings';
import {
  StepFilter,
  StepFilterGroup,
  StepLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/src/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLibraryPlus, IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { v4 } from 'uuid';

type WorkflowStepFilterAddFilterRuleSelectProps = {
  stepFilterGroup: StepFilterGroup;
};

const BASE_NEW_STEP_FILTER = {
  type: 'unknown',
  label: '',
  value: '',
  operand: ViewFilterOperand.Is,
  displayValue: '',
  stepFilterGroupId: '',
  stepOutputKey: '',
};

export const WorkflowStepFilterAddFilterRuleSelect = ({
  stepFilterGroup,
}: WorkflowStepFilterAddFilterRuleSelectProps) => {
  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

  const dropdownId = getAdvancedFilterAddFilterRuleSelectDropdownId(
    stepFilterGroup.id,
  );

  const { lastChildPosition } = useChildStepFiltersAndChildStepFilterGroups({
    stepFilterGroupId: stepFilterGroup.id,
  });

  const newPositionInStepFilterGroup = lastChildPosition + 1;

  const { closeDropdown } = useCloseDropdown();

  const handleAddFilter = () => {
    closeDropdown(dropdownId);

    const newStepFilter = {
      id: v4(),
      ...BASE_NEW_STEP_FILTER,
      stepFilterGroupId: stepFilterGroup.id,
      positionInStepFilterGroup: newPositionInStepFilterGroup,
    } satisfies StepFilter;

    upsertStepFilterSettings({
      stepFilterToUpsert: newStepFilter,
    });
  };

  const handleAddFilterGroup = () => {
    closeDropdown(dropdownId);

    const newStepFilterGroupId = v4();

    const newStepFilterGroup: StepFilterGroup = {
      id: newStepFilterGroupId,
      logicalOperator: StepLogicalOperator.AND,
      parentStepFilterGroupId: stepFilterGroup.id,
      positionInStepFilterGroup: newPositionInStepFilterGroup,
    };

    const newStepFilter: StepFilter = {
      id: v4(),
      ...BASE_NEW_STEP_FILTER,
      stepFilterGroupId: newStepFilterGroupId,
      positionInStepFilterGroup: 1,
    };

    upsertStepFilterSettings({
      stepFilterToUpsert: newStepFilter,
      stepFilterGroupToUpsert: newStepFilterGroup,
    });
  };

  const isFilterRuleGroupOptionVisible = !isDefined(
    stepFilterGroup.parentStepFilterGroupId,
  );

  if (!isFilterRuleGroupOptionVisible) {
    return (
      <ActionButton
        action={{
          Icon: IconPlus,
          label: 'Add rule',
          shortLabel: 'Add rule',
          key: 'add-rule',
        }}
        onClick={handleAddFilter}
      />
    );
  }

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <ActionButton
          action={{
            Icon: IconPlus,
            label: 'Add filter rule',
            shortLabel: 'Add filter rule',
            key: 'add-filter-rule',
          }}
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            <MenuItem
              LeftIcon={IconPlus}
              text="Add rule"
              onClick={handleAddFilter}
            />
            {isFilterRuleGroupOptionVisible && (
              <MenuItem
                LeftIcon={IconLibraryPlus}
                text="Add rule group"
                onClick={handleAddFilterGroup}
              />
            )}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
    />
  );
};
