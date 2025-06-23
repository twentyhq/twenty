import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS } from '@/views/constants/ViewBarFilterBottomMenuItemIds';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Pill } from 'twenty-ui/components';
import { IconFilter } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { v4 } from 'uuid';

const StyledPill = styled(Pill)`
  background: ${({ theme }) => theme.color.blueAccent10};
  color: ${({ theme }) => theme.color.blue};
`;

export const ViewBarFilterDropdownAdvancedFilterButton = () => {
  const advancedFilterQuerySubFilterCount = 0; // TODO

  const { t } = useLingui();

  const isSelected = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.ADVANCED_FILTER,
  );

  const { openDropdown: openAdvancedFilterDropdown } = useDropdown(
    ADVANCED_FILTER_DROPDOWN_ID,
  );

  const { closeDropdown: closeObjectFilterDropdown } = useDropdown(
    VIEW_BAR_FILTER_DROPDOWN_ID,
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

  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const handleClick = () => {
    if (!isDefined(currentView)) {
      throw new Error('Missing current view id');
    }

    const alreadyHasAdvancedFilterGroup = currentRecordFilterGroups.length > 0;

    if (!alreadyHasAdvancedFilterGroup) {
      const newRecordFilterGroup = {
        id: v4(),
        viewId: currentView.id,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      };

      upsertRecordFilterGroup(newRecordFilterGroup);

      const defaultFieldMetadataItem =
        availableFieldMetadataItemsForFilter.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id ===
            objectMetadataItem?.labelIdentifierFieldMetadataId,
        ) ?? availableFieldMetadataItemsForFilter[0];

      if (!isDefined(defaultFieldMetadataItem)) {
        throw new Error('Missing default filter definition');
      }

      const { newRecordFilter } = createEmptyRecordFilterFromFieldMetadataItem(
        defaultFieldMetadataItem,
      );

      newRecordFilter.recordFilterGroupId = newRecordFilterGroup.id;

      upsertRecordFilter(newRecordFilter);

      setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
    }

    closeObjectFilterDropdown();
    openAdvancedFilterDropdown();
  };

  return (
    <SelectableListItem
      itemId={VIEW_BAR_FILTER_BOTTOM_MENU_ITEM_IDS.ADVANCED_FILTER}
      onEnter={handleClick}
    >
      <MenuItem
        text={t`Advanced filter`}
        onClick={handleClick}
        LeftIcon={IconFilter}
        focused={isSelected}
      />
      {advancedFilterQuerySubFilterCount > 0 && (
        <StyledPill label={advancedFilterQuerySubFilterCount.toString()} />
      )}
    </SelectableListItem>
  );
};
