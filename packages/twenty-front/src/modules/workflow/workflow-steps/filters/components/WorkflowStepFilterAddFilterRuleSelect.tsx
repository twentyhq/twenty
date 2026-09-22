import { Button } from 'twenty-ui/primitives/input';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { getAdvancedFilterAddFilterRuleSelectDropdownId } from '@/object-record/advanced-filter/utils/getAdvancedFilterAddFilterRuleSelectDropdownId';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAddStepFilterToGroup } from '@/workflow/workflow-steps/filters/hooks/useAddStepFilterToGroup';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import { buildEmptyStepFilter } from '@/workflow/workflow-steps/filters/utils/buildEmptyStepFilter';
import { StepLogicalOperator, type StepFilterGroup } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { t } from '@lingui/core/macro';
import { IconLibraryPlus, IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';
import { Menu } from 'twenty-ui/primitives/surfaces';

type WorkflowStepFilterAddFilterRuleSelectProps = {
  stepFilterGroup: StepFilterGroup;
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

  const { addStepFilterToGroup } = useAddStepFilterToGroup({
    stepFilterGroup,
  });

  const handleAddFilter = () => {
    closeDropdown(dropdownId);

    addStepFilterToGroup();
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

    upsertStepFilterSettings({
      stepFilterToUpsert: buildEmptyStepFilter({
        stepFilterGroupId: newStepFilterGroupId,
        positionInStepFilterGroup: 1,
      }),
      stepFilterGroupToUpsert: newStepFilterGroup,
    });
  };

  const isFilterRuleGroupOptionVisible = !isDefined(
    stepFilterGroup.parentStepFilterGroupId,
  );

  if (!isFilterRuleGroupOptionVisible) {
    return (
      <CommandMenuButton
        command={{
          Icon: IconPlus,
          label: t`Add rule`,
          shortLabel: t`Add rule`,
          key: 'add-rule',
        }}
        onClick={handleAddFilter}
      />
    );
  }

  return (
    <DropdownMenu
      dropdownId={dropdownId}
      clickableComponent={
        <Button
          startIcon={<IconPlus />}
          size="sm"
          variant="outline"
        >{t`Add filter rule`}</Button>
      }
      dropdownComponents={
        <DropdownContent>
          <Menu.Group>
            <Menu.Item
              startIcon={<IconPlus />}
              onClick={handleAddFilter}
            >{t`Add rule`}</Menu.Item>
            {isFilterRuleGroupOptionVisible && (
              <Menu.Item
                startIcon={<IconLibraryPlus />}
                onClick={handleAddFilterGroup}
              >{t`Add rule group`}</Menu.Item>
            )}
          </Menu.Group>
        </DropdownContent>
      }
      dropdownPlacement="bottom-start"
    />
  );
};
