import { AdvancedFilterRuleOptionsDropdownButton } from '@/object-record/advanced-filter/components/AdvancedFilterRuleOptionsDropdownButton';
import { useCurrentViewFilter } from '@/object-record/advanced-filter/hooks/useCurrentViewFilter';
import { useCurrentViewViewFilterGroup } from '@/object-record/advanced-filter/hooks/useCurrentViewViewFilterGroup';
import { useDeleteCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useDeleteCombinedViewFilterGroup';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { isDefined, MenuItem } from 'twenty-ui';

type AdvancedFilterRuleOptionsDropdownProps =
  | {
      viewFilterId: string;
      viewFilterGroupId?: never;
    }
  | {
      viewFilterId?: never;
      viewFilterGroupId: string;
    };

export const AdvancedFilterRuleOptionsDropdown = ({
  viewFilterId,
  viewFilterGroupId,
}: AdvancedFilterRuleOptionsDropdownProps) => {
  const dropdownId = `advanced-filter-rule-options-${viewFilterId ?? viewFilterGroupId}`;

  const { deleteCombinedViewFilter } = useDeleteCombinedViewFilters();
  const { deleteCombinedViewFilterGroup } = useDeleteCombinedViewFilterGroup();

  const { currentViewFilterGroup, childViewFiltersAndViewFilterGroups } =
    useCurrentViewViewFilterGroup({
      viewFilterGroupId,
    });

  const currentViewFilter = useCurrentViewFilter({
    viewFilterId,
  });

  const handleRemove = async () => {
    if (isDefined(viewFilterId)) {
      deleteCombinedViewFilter(viewFilterId);

      const isOnlyViewFilterInGroup =
        childViewFiltersAndViewFilterGroups.length === 1;

      if (
        isOnlyViewFilterInGroup &&
        isDefined(currentViewFilter?.viewFilterGroupId)
      ) {
        deleteCombinedViewFilterGroup(currentViewFilter.viewFilterGroupId);
      }
    } else if (isDefined(currentViewFilterGroup)) {
      deleteCombinedViewFilterGroup(currentViewFilterGroup.id);

      const childViewFilters = childViewFiltersAndViewFilterGroups.filter(
        (child) => child.__typename === 'ViewFilter',
      );

      for (const childViewFilter of childViewFilters) {
        await deleteCombinedViewFilter(childViewFilter.id);
      }
    } else {
      throw new Error('No view filter or view filter group to remove');
    }
  };

  const removeButtonLabel = viewFilterId ? 'Remove rule' : 'Remove rule group';

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <AdvancedFilterRuleOptionsDropdownButton dropdownId={dropdownId} />
      }
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem text={removeButtonLabel} onClick={handleRemove} />
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
    />
  );
};
