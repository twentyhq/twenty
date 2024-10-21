import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useCurrentViewViewFilterGroup } from '@/object-record/advanced-filter/hooks/useCurrentViewViewFilterGroup';
import { useUpsertCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useUpsertCombinedViewFilterGroup';
import { getOperandsForFilterDefinition } from '@/object-record/object-filter-dropdown/utils/getOperandsForFilterType';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { useCallback } from 'react';
import { IconLibraryPlus, IconPlus, isDefined } from 'twenty-ui';
import { v4 } from 'uuid';

type AdvancedFilterAddFilterRuleSelectProps = {
  currentViewFilterGroupId?: string;
};

export const AdvancedFilterAddFilterRuleSelect = ({
  currentViewFilterGroupId,
}: AdvancedFilterAddFilterRuleSelectProps) => {
  const { currentViewFilterGroup, childViewFiltersAndViewFilterGroups } =
    useCurrentViewViewFilterGroup({
      currentViewFilterGroupId,
    });

  const dropdownId = `advanced-filter-add-filter-rule-${currentViewFilterGroup?.id}`;

  const { currentViewId } = useGetCurrentView();

  const { upsertCombinedViewFilterGroup } = useUpsertCombinedViewFilterGroup();
  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const lastChildRule: ViewFilter | ViewFilterGroup | undefined =
    childViewFiltersAndViewFilterGroups[
      childViewFiltersAndViewFilterGroups.length - 1
    ];

  const newPositionInViewFilterGroup = isDefined(lastChildRule)
    ? (lastChildRule.positionInViewFilterGroup ?? 0) + 1
    : 0;

  const { closeDropdown } = useDropdown(dropdownId);

  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const objectMetadataId =
    currentViewWithCombinedFiltersAndSorts?.objectMetadataId;

  if (!objectMetadataId) {
    throw new Error('Object metadata id is missing from current view');
  }

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
  );

  const getDefaultFilterDefinition = useCallback(() => {
    const defaultFilterDefinition =
      availableFilterDefinitions.find(
        (filterDefinition) =>
          filterDefinition.fieldMetadataId ===
          objectMetadataItem?.labelIdentifierFieldMetadataId,
      ) ?? availableFilterDefinitions?.[0];

    if (!defaultFilterDefinition) {
      throw new Error('Missing default filter definition');
    }

    return defaultFilterDefinition;
  }, [availableFilterDefinitions, objectMetadataItem]);

  const handleAddFilter = () => {
    closeDropdown();

    const defaultFilterDefinition = getDefaultFilterDefinition();

    upsertCombinedViewFilter({
      id: v4(),
      fieldMetadataId: defaultFilterDefinition.fieldMetadataId,
      operand: getOperandsForFilterDefinition(defaultFilterDefinition)[0],
      definition: defaultFilterDefinition,
      value: '',
      displayValue: '',
      viewFilterGroupId: currentViewFilterGroup?.id,
      positionInViewFilterGroup: newPositionInViewFilterGroup,
    });
  };

  const handleAddFilterGroup = () => {
    closeDropdown();

    if (!currentViewId) {
      throw new Error('Missing view id');
    }

    const newViewFilterGroup = {
      id: v4(),
      viewId: currentViewId,
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
      parentViewFilterGroupId: currentViewFilterGroup?.id,
      positionInViewFilterGroup: newPositionInViewFilterGroup,
    };

    upsertCombinedViewFilterGroup(newViewFilterGroup);

    const defaultFilterDefinition = getDefaultFilterDefinition();

    upsertCombinedViewFilter({
      id: v4(),
      fieldMetadataId: defaultFilterDefinition.fieldMetadataId,
      operand: getOperandsForFilterDefinition(defaultFilterDefinition)[0],
      definition: defaultFilterDefinition,
      value: '',
      displayValue: '',
      viewFilterGroupId: newViewFilterGroup.id,
      positionInViewFilterGroup: newPositionInViewFilterGroup,
    });
  };

  const isFilterRuleGroupOptionVisible = !isDefined(
    currentViewFilterGroup?.parentViewFilterGroupId,
  );

  if (!isFilterRuleGroupOptionVisible) {
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
      dropdownId={dropdownId}
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
          {isFilterRuleGroupOptionVisible && (
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
