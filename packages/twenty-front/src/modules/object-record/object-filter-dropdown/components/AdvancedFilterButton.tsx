import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { formatFieldMetadataItemAsFilterDefinition } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useUpsertCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useUpsertCombinedViewFilterGroup';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { getRecordFilterOperandsForRecordFilterDefinition } from '@/object-record/record-filter/utils/getRecordFilterOperandsForRecordFilterDefinition';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import {
  IconFilter,
  MenuItemLeftContent,
  Pill,
  StyledMenuItemBase,
} from 'twenty-ui';
import { v4 } from 'uuid';

export const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const StyledMenuItemSelect = styled(StyledMenuItemBase)`
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const StyledPill = styled(Pill)`
  background: ${({ theme }) => theme.color.blueAccent10};
  color: ${({ theme }) => theme.color.blue};
`;

export const AdvancedFilterButton = () => {
  const advancedFilterQuerySubFilterCount = 0; // TODO

  const { openDropdown: openAdvancedFilterDropdown } = useDropdown(
    ADVANCED_FILTER_DROPDOWN_ID,
  );

  const { closeDropdown: closeObjectFilterDropdown } = useDropdown(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const { currentViewId, currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView();

  const { upsertCombinedViewFilterGroup } = useUpsertCombinedViewFilterGroup();

  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const objectMetadataId =
    currentViewWithCombinedFiltersAndSorts?.objectMetadataId;

  if (!objectMetadataId) {
    throw new Error('Object metadata id is missing from current view');
  }

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId ?? null,
  });

  const availableFieldMetadataItemsForFilter = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const handleClick = () => {
    if (!currentViewId) {
      throw new Error('Missing current view id');
    }

    const alreadyHasAdvancedFilterGroup =
      (currentViewWithCombinedFiltersAndSorts?.viewFilterGroups?.length ?? 0) >
      0;

    if (!alreadyHasAdvancedFilterGroup) {
      const newViewFilterGroup = {
        id: v4(),
        viewId: currentViewId,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      };

      upsertCombinedViewFilterGroup(newViewFilterGroup);

      const defaultFieldMetadataItem =
        availableFieldMetadataItemsForFilter.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id ===
            objectMetadataItem?.labelIdentifierFieldMetadataId,
        ) ?? availableFieldMetadataItemsForFilter[0];

      if (!isDefined(defaultFieldMetadataItem)) {
        throw new Error('Missing default filter definition');
      }

      const filterDefinition = formatFieldMetadataItemAsFilterDefinition({
        field: defaultFieldMetadataItem,
      });

      upsertCombinedViewFilter({
        id: v4(),
        fieldMetadataId: defaultFieldMetadataItem.id,
        operand:
          getRecordFilterOperandsForRecordFilterDefinition(filterDefinition)[0],
        definition: filterDefinition,
        value: '',
        displayValue: '',
        viewFilterGroupId: newViewFilterGroup.id,
      });
    }

    openAdvancedFilterDropdown();
    closeObjectFilterDropdown();
  };

  return (
    <StyledContainer>
      <StyledMenuItemSelect onClick={handleClick}>
        <MenuItemLeftContent LeftIcon={IconFilter} text="Advanced filter" />
        {advancedFilterQuerySubFilterCount > 0 && (
          <StyledPill label={advancedFilterQuerySubFilterCount.toString()} />
        )}
      </StyledMenuItemSelect>
    </StyledContainer>
  );
};
