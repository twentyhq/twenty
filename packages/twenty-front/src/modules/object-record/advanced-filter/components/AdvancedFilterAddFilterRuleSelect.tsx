import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useUpsertCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useUpsertCombinedViewFilterGroup';
import { getRecordFilterOperandsForRecordFilterDefinition } from '@/object-record/record-filter/utils/getRecordFilterOperandsForRecordFilterDefinition';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { useCallback } from 'react';
import {
  IconLibraryPlus,
  IconPlus,
  isDefined,
  LightButton,
  MenuItem,
} from 'twenty-ui';
import { v4 } from 'uuid';

type AdvancedFilterAddFilterRuleSelectProps = {
  viewFilterGroup: ViewFilterGroup;
  lastChildPosition?: number;
};

export const AdvancedFilterAddFilterRuleSelect = ({
  viewFilterGroup,
  lastChildPosition = 0,
}: AdvancedFilterAddFilterRuleSelectProps) => {
  const dropdownId = `advanced-filter-add-filter-rule-${viewFilterGroup.id}`;

  const { currentViewId } = useGetCurrentView();

  const { upsertCombinedViewFilterGroup } = useUpsertCombinedViewFilterGroup();
  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const newPositionInViewFilterGroup = lastChildPosition + 1;

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
      operand: getRecordFilterOperandsForRecordFilterDefinition(
        defaultFilterDefinition,
      )[0],
      definition: defaultFilterDefinition,
      value: '',
      displayValue: '',
      viewFilterGroupId: viewFilterGroup.id,
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
      parentViewFilterGroupId: viewFilterGroup.id,
      positionInViewFilterGroup: newPositionInViewFilterGroup,
    };

    upsertCombinedViewFilterGroup(newViewFilterGroup);

    const defaultFilterDefinition = getDefaultFilterDefinition();

    upsertCombinedViewFilter({
      id: v4(),
      fieldMetadataId: defaultFilterDefinition.fieldMetadataId,
      operand: getRecordFilterOperandsForRecordFilterDefinition(
        defaultFilterDefinition,
      )[0],
      definition: defaultFilterDefinition,
      value: '',
      displayValue: '',
      viewFilterGroupId: newViewFilterGroup.id,
      positionInViewFilterGroup: newPositionInViewFilterGroup,
    });
  };

  const isFilterRuleGroupOptionVisible = !isDefined(
    viewFilterGroup.parentViewFilterGroupId,
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
