import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { useUpdateConditionalAvailabilityFilterSettings } from '@/conditional-availability/filter-builder/hooks/useUpdateConditionalAvailabilityFilterSettings';
import { currentConditionalAvailabilityFilterGroupComponentState } from '@/conditional-availability/filter-builder/states/currentConditionalAvailabilityFilterGroupComponentState';
import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { createEmptyConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/utils/createEmptyConditionalAvailabilityFilter';
import { updateConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/utils/updateConditionalAvailabilityFilterGroup';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconLibraryPlus, IconPlus } from 'twenty-ui/icon';
import { v4 } from 'uuid';

type ConditionalAvailabilityFilterAddFilterRuleSelectProps = {
  filterGroup: ConditionalAvailabilityFilterGroup;
};

export const ConditionalAvailabilityFilterAddFilterRuleSelect = ({
  filterGroup,
}: ConditionalAvailabilityFilterAddFilterRuleSelectProps) => {
  const { t } = useLingui();
  const currentConditionalAvailabilityFilterGroup = useAtomComponentStateValue(
    currentConditionalAvailabilityFilterGroupComponentState,
  );
  const { updateConditionalAvailabilityFilterSettings } =
    useUpdateConditionalAvailabilityFilterSettings();

  const addFilterGroupChild = (
    filterGroupChild:
      | ConditionalAvailabilityFilter
      | ConditionalAvailabilityFilterGroup,
  ) => {
    updateConditionalAvailabilityFilterSettings((filterGroupToUpdateFrom) =>
      updateConditionalAvailabilityFilterGroup({
        filterGroup: filterGroupToUpdateFrom,
        filterGroupId: filterGroup.id,
        update: (filterGroupToUpdate) => ({
          ...filterGroupToUpdate,
          children: [...filterGroupToUpdate.children, filterGroupChild],
        }),
      }),
    );
  };

  const handleAddFilter = () => {
    addFilterGroupChild(
      createEmptyConditionalAvailabilityFilter({ variable: 'currentRole' }),
    );
  };

  const handleAddFilterGroup = () => {
    addFilterGroupChild({
      type: 'filterGroup',
      id: v4(),
      logicalOperator: doNotTranslate('AND'),
      children: [
        createEmptyConditionalAvailabilityFilter({ variable: 'currentRole' }),
      ],
    });
  };

  const isFilterRuleGroupOptionVisible =
    filterGroup.id === currentConditionalAvailabilityFilterGroup?.id;

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
    <DropdownRoot
      dropdownId={`conditional-availability-filter-add-filter-rule-${filterGroup.id}`}
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
      <DropdownContent>
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconPlus />}
            onClick={handleAddFilter}
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
      </DropdownContent>
    </DropdownRoot>
  );
};
