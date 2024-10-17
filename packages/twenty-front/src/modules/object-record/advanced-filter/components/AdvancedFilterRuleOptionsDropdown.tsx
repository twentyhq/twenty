import { AdvancedFilterRuleOptionsDropdownButton } from '@/object-record/advanced-filter/components/AdvancedFilterRuleOptionsDropdownButton';
import { useDeleteCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useDeleteCombinedViewFilterGroup';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { isDefined } from 'twenty-ui';

type AdvancedFilterRuleOptionsDropdownProps = {
  dropdownId: string;
} & (
  | {
      viewFilterId: string;
      parentViewFilterGroupId: string;
      isOnlyViewFilterInGroup: boolean;
      viewFilterGroupId?: never;
    }
  | {
      viewFilterId?: never;
      parentViewFilterGroupId?: never;
      isOnlyViewFilterInGroup?: never;
      viewFilterGroupId: string;
    }
);

export const AdvancedFilterRuleOptionsDropdown = (
  props: AdvancedFilterRuleOptionsDropdownProps,
) => {
  const { deleteCombinedViewFilter } = useDeleteCombinedViewFilters();
  const { deleteCombinedViewFilterGroup } = useDeleteCombinedViewFilterGroup();

  const handleRemove = () => {
    if (isDefined(props.viewFilterId)) {
      deleteCombinedViewFilter(props.viewFilterId);
      if (props.isOnlyViewFilterInGroup === true) {
        deleteCombinedViewFilterGroup(props.parentViewFilterGroupId);
      }
    } else if (isDefined(props.viewFilterGroupId)) {
      deleteCombinedViewFilterGroup(props.viewFilterGroupId);
    }
  };

  const removeButtonLabel = props.viewFilterId
    ? 'Remove rule'
    : 'Remove rule group';

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
