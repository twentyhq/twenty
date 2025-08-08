import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { useRemoveRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useRemoveRecordFilterGroup';
import { useRemoveRootRecordFilterGroupIfEmpty } from '@/object-record/record-filter-group/hooks/useRemoveRootRecordFilterGroupIfEmpty';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';

import { SOFT_DELETE_FILTER_FIELD_NAME } from '@/object-record/record-filter/constants/SoftDeleteFilterFieldName';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { getAllRecordFilterDescendantsOfRecordFilterGroup } from '@/object-record/record-filter/utils/getAllRecordFilterDescendantsOfRecordFilterGroup';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { plural } from 'pluralize';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/display';

export const AdvancedFilterChip = () => {
  const { closeDropdown } = useCloseDropdown();

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const advancedRecordFilterIds = currentRecordFilters
    .filter((recordFilter) => isDefined(recordFilter.recordFilterGroupId))
    .map((recordFilter) => recordFilter.id);

  const { removeRecordFilter } = useRemoveRecordFilter();
  const { removeRecordFilterGroup } = useRemoveRecordFilterGroup();

  const { removeRootRecordFilterGroupIfEmpty } =
    useRemoveRootRecordFilterGroupIfEmpty();

  const rootRecordFilterGroup = useRecoilComponentValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { childRecordFiltersAndRecordFilterGroups } =
    useChildRecordFiltersAndRecordFilterGroups({
      recordFilterGroupId: rootRecordFilterGroup?.id,
    });

  const handleRemoveClick = () => {
    closeDropdown(ADVANCED_FILTER_DROPDOWN_ID);

    const viewFilterGroupIds = currentRecordFilterGroups.map(
      (recordFilterGroup) => recordFilterGroup.id,
    );

    for (const viewFilterGroupId of viewFilterGroupIds) {
      removeRecordFilterGroup(viewFilterGroupId);
    }

    for (const recordFilterId of advancedRecordFilterIds) {
      removeRecordFilter({ recordFilterId });
    }

    removeRootRecordFilterGroupIfEmpty();
  };

  const advancedFilterCount = childRecordFiltersAndRecordFilterGroups.length;

  const labelText = 'advanced rule';
  const chipLabel = `${advancedFilterCount} ${advancedFilterCount === 1 ? labelText : plural(labelText)}`;

  const { objectMetadataItems } = useObjectMetadataItems();

  const hasAnyDeletedAtFilterInAdvancedFilters = useMemo(() => {
    const recordFiltersDescendantOfRootGroup = rootRecordFilterGroup?.id
      ? getAllRecordFilterDescendantsOfRecordFilterGroup({
          recordFilterGroupId: rootRecordFilterGroup?.id,
          recordFilterGroups: currentRecordFilterGroups,
          recordFilters: currentRecordFilters,
        })
      : [];

    const fieldMetadataItems = objectMetadataItems.flatMap(
      (item) => item.fields,
    );

    return recordFiltersDescendantOfRootGroup.some((recordFilter) => {
      const correspondingMetadataItem = fieldMetadataItems.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === recordFilter.fieldMetadataId,
      );

      if (isDefined(correspondingMetadataItem)) {
        return correspondingMetadataItem.name === SOFT_DELETE_FILTER_FIELD_NAME;
      }

      return false;
    });
  }, [
    currentRecordFilterGroups,
    currentRecordFilters,
    rootRecordFilterGroup,
    objectMetadataItems,
  ]);

  return (
    <SortOrFilterChip
      testId={ADVANCED_FILTER_DROPDOWN_ID}
      labelKey={chipLabel}
      labelValue=""
      Icon={IconFilter}
      onRemove={handleRemoveClick}
      variant={hasAnyDeletedAtFilterInAdvancedFilters ? 'danger' : 'default'}
      type="filter"
    />
  );
};
