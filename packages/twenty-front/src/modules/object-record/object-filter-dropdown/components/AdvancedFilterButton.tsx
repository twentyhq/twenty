import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useUpsertCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useUpsertCombinedViewFilterGroup';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
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

  const { t } = useLingui();

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

      const filterType = getFilterTypeFromFieldType(
        defaultFieldMetadataItem.type,
      );

      const firstOperand = getRecordFilterOperands({
        filterType,
      })[0];

      upsertCombinedViewFilter({
        id: v4(),
        fieldMetadataId: defaultFieldMetadataItem.id,
        operand: firstOperand,
        value: '',
        displayValue: '',
        viewFilterGroupId: newViewFilterGroup.id,
        type: getFilterTypeFromFieldType(defaultFieldMetadataItem.type),
        label: defaultFieldMetadataItem.label,
      });
    }

    openAdvancedFilterDropdown();
    closeObjectFilterDropdown();
  };

  return (
    <StyledContainer>
      <StyledMenuItemSelect onClick={handleClick}>
        <MenuItemLeftContent LeftIcon={IconFilter} text={t`Advanced filter`} />
        {advancedFilterQuerySubFilterCount > 0 && (
          <StyledPill label={advancedFilterQuerySubFilterCount.toString()} />
        )}
      </StyledMenuItemSelect>
    </StyledContainer>
  );
};
