import { useUpsertCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useUpsertCombinedViewFilterGroup';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { IconLibraryPlus, IconPlus } from 'twenty-ui';
import { v4 } from 'uuid';

interface AdvancedFilterAddFilterRuleSelectProps {
  viewId?: string;
  currentViewFilterGroup: ViewFilterGroup;
  childViewFiltersAndViewFilterGroups: (ViewFilterGroup | ViewFilter)[];
  isFilterRuleGroupOptionVisible?: boolean;
}

export const AdvancedFilterAddFilterRuleSelect = (
  props: AdvancedFilterAddFilterRuleSelectProps,
) => {
  const { upsertCombinedViewFilterGroup } = useUpsertCombinedViewFilterGroup();
  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const newPositionInViewFilterGroup =
    (props.childViewFiltersAndViewFilterGroups[
      props.childViewFiltersAndViewFilterGroups.length - 1
    ]?.positionInViewFilterGroup ?? 0) + 1;

  const handleAddFilter = () => {
    upsertCombinedViewFilter({
      id: v4(),
      variant: 'default',
      fieldMetadataId: undefined as any,
      operand: ViewFilterOperand.Is,
      value: '',
      displayValue: '',
      definition: {} as any,
      viewFilterGroupId: props.currentViewFilterGroup.id,
      positionInViewFilterGroup: newPositionInViewFilterGroup,
    });
  };

  const handleAddFilterGroup = () => {
    if (!props.viewId) {
      throw new Error('Missing view id');
    }

    upsertCombinedViewFilterGroup({
      id: v4(),
      viewId: props.viewId,
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
      parentViewFilterGroupId: props.currentViewFilterGroup.id,
      positionInViewFilterGroup: newPositionInViewFilterGroup,
    });
  };

  if (!props.isFilterRuleGroupOptionVisible) {
    return (
      <LightButton
        Icon={IconPlus}
        title="Add filter rule"
        onClick={handleAddFilter}
      />
    );
  }

  return (
    <Dropdown
      disableBlur
      dropdownId={`advanced-filter-add-filter-rule-${props.currentViewFilterGroup.id}`}
      clickableComponent={
        <LightButton Icon={IconPlus} title="Add filter rule" />
      }
      dropdownComponents={
        <DropdownMenuItemsContainer>
          <MenuItem
            LeftIcon={IconPlus}
            text="Add rule"
            onClick={handleAddFilter}
          />
          {props.isFilterRuleGroupOptionVisible && (
            <MenuItem
              LeftIcon={IconLibraryPlus}
              text="Add rule group"
              onClick={handleAddFilterGroup}
            />
          )}
        </DropdownMenuItemsContainer>
      }
      dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
    />
  );
};
