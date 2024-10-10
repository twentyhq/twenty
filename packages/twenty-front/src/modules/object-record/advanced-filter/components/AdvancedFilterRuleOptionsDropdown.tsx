import { AdvancedFilterRuleOptionsDropdownButton } from '@/object-record/advanced-filter/components/AdvancedFilterRuleOptionsDropdownButton';
import { useDeleteCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useDeleteCombinedViewFilterGroup';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { isDefined } from 'twenty-ui';

type AdvancedFilterRuleOptionsDropdownProps = {
  dropdownId: string;
} & (
  | { viewFilterId: string; viewFilterGroupId?: never }
  | { viewFilterId?: never; viewFilterGroupId: string }
);

export const AdvancedFilterRuleOptionsDropdown = (
  props: AdvancedFilterRuleOptionsDropdownProps,
) => {
  const { deleteCombinedViewFilter } = useDeleteCombinedViewFilters();
  const { deleteCombinedViewFilterGroup } = useDeleteCombinedViewFilterGroup();

  const handleRemove = () => {
    if (isDefined(props.viewFilterId)) {
      deleteCombinedViewFilter(props.viewFilterId);
    } else if (isDefined(props.viewFilterGroupId)) {
      deleteCombinedViewFilterGroup(props.viewFilterGroupId);
    }
  };

  return (
    <Dropdown
      disableBlur
      dropdownId={props.dropdownId}
      clickableComponent={
        <AdvancedFilterRuleOptionsDropdownButton
          dropdownId={props.dropdownId}
        />
      }
      dropdownComponents={
        <DropdownMenu width="160px">
          <DropdownMenuItemsContainer>
            <MenuItem text="Remove filter rule" onClick={handleRemove} />
          </DropdownMenuItemsContainer>
        </DropdownMenu>
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      dropdownMenuWidth={280}
    />
  );
};
