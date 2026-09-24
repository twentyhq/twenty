import { getAdvancedFilterAddFilterRuleSelectDropdownId } from '@/object-record/advanced-filter/utils/getAdvancedFilterAddFilterRuleSelectDropdownId';
import { Dropdown } from 'twenty-ui/components';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { DropdownRootContent } from '@/ui/layout/dropdown/components/DropdownRootContent';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { useAddStepFilterToGroup } from '@/workflow/workflow-steps/filters/hooks/useAddStepFilterToGroup';
import { useChildStepFiltersAndChildStepFilterGroups } from '@/workflow/workflow-steps/filters/hooks/useChildStepFiltersAndChildStepFilterGroups';
import { useUpsertStepFilterSettings } from '@/workflow/workflow-steps/filters/hooks/useUpsertStepFilterSettings';
import { buildEmptyStepFilter } from '@/workflow/workflow-steps/filters/utils/buildEmptyStepFilter';
import { t } from '@lingui/core/macro';
import { StepLogicalOperator, type StepFilterGroup } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLibraryPlus, IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

type WorkflowStepFilterAddFilterRuleSelectProps = {
  stepFilterGroup: StepFilterGroup;
};

export const WorkflowStepFilterAddFilterRuleSelect = ({
  stepFilterGroup,
}: WorkflowStepFilterAddFilterRuleSelectProps) => {
  const { upsertStepFilterSettings } = useUpsertStepFilterSettings();

  const { lastChildPosition } = useChildStepFiltersAndChildStepFilterGroups({
    stepFilterGroupId: stepFilterGroup.id,
  });

  const newPositionInStepFilterGroup = lastChildPosition + 1;

  const { addStepFilterToGroup } = useAddStepFilterToGroup({
    stepFilterGroup,
  });

  const handleAddFilterGroup = () => {
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
        onClick={addStepFilterToGroup}
      />
    );
  }

  return (
    <DropdownRoot
      dropdownId={getAdvancedFilterAddFilterRuleSelectDropdownId(
        stepFilterGroup.id,
      )}
      type="menu"
    >
      <Dropdown.Trigger
        render={
          <NavigationButton
            size="sm"
            variant="outline"
            color="neutral"
            startIcon={<IconPlus />}
            aria-label={t`Add filter rule`}
          >
            {t`Add filter rule`}
          </NavigationButton>
        }
      />
      <DropdownRootContent>
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconPlus />}
            onClick={addStepFilterToGroup}
          >
            {t`Add rule`}
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            startIcon={<IconLibraryPlus />}
            onClick={handleAddFilterGroup}
          >
            {t`Add rule group`}
          </Dropdown.ActionItem>
        </Dropdown.Section>
      </DropdownRootContent>
    </DropdownRoot>
  );
};
