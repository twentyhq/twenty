import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
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

  const { currentView } = useGetCurrentViewOnly();

  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const objectMetadataId = currentView?.objectMetadataId;

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

  const currentRecordFilterGroups = useRecoilComponentValueV2(
    currentRecordFilterGroupsComponentState,
  );

  const handleClick = () => {
    if (!isDefined(currentView)) {
      throw new Error('Missing current view id');
    }

    const alreadyHasAdvancedFilterGroup = currentRecordFilterGroups.length > 0;

    if (!alreadyHasAdvancedFilterGroup) {
      const newRecordFilterGroup = {
        id: v4(),
        viewId: currentView.id,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
      };

      upsertRecordFilterGroup({
        id: newRecordFilterGroup.id,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      });

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

      upsertRecordFilter({
        id: v4(),
        fieldMetadataId: defaultFieldMetadataItem.id,
        operand: firstOperand,
        value: '',
        displayValue: '',
        recordFilterGroupId: newRecordFilterGroup.id,
        type: getFilterTypeFromFieldType(defaultFieldMetadataItem.type),
        label: defaultFieldMetadataItem.label,
        positionInRecordFilterGroup: 1,
      });
    }

    closeObjectFilterDropdown();
    openAdvancedFilterDropdown({
      scope: ADVANCED_FILTER_DROPDOWN_ID,
    });
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
