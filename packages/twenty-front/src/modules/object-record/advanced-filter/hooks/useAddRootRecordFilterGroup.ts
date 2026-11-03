import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { type FieldSelectLeadingSection } from '@/object-record/advanced-filter/types/FieldSelectLeadingSection';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { doNotTranslate } from 'twenty-shared/i18n';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useAddRootRecordFilterGroup = ({
  objectMetadataItem,
  fieldSelectLeadingSections,
}: {
  objectMetadataItem?: EnrichedObjectMetadataItem;
  fieldSelectLeadingSections?: FieldSelectLeadingSection[];
}) => {
  const rootRecordFilterGroup = useAtomComponentSelectorValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const availableFieldMetadataItemsForFilter = useAtomFamilySelectorValue(
    availableFieldMetadataItemsForFilterFamilySelector,
    {
      objectMetadataItemId: objectMetadataItem?.id ?? '',
    },
  );

  const defaultFieldMetadataItem =
    fieldSelectLeadingSections?.[0]?.fieldMetadataItems[0] ??
    availableFieldMetadataItemsForFilter.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id ===
        objectMetadataItem?.labelIdentifierFieldMetadataId,
    ) ??
    availableFieldMetadataItemsForFilter[0];

  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { createEmptyRecordFilterFromFieldMetadataItem } =
    useCreateEmptyRecordFilterFromFieldMetadataItem();

  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const setHasInitializedCurrentRecordFilters = useSetAtomComponentFamilyState(
    hasInitializedCurrentRecordFiltersComponentFamilyState,
    {},
  );

  const addRootRecordFilterGroup = () => {
    if (isDefined(rootRecordFilterGroup)) {
      return;
    }

    setHasInitializedCurrentRecordFilters(false);

    const newRecordFilterGroup = {
      id: v4(),
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
    };

    upsertRecordFilterGroup(newRecordFilterGroup);

    if (!isDefined(defaultFieldMetadataItem)) {
      throw new Error(doNotTranslate('Missing default filter definition'));
    }

    const { newRecordFilter } = createEmptyRecordFilterFromFieldMetadataItem(
      defaultFieldMetadataItem,
    );

    newRecordFilter.recordFilterGroupId = newRecordFilterGroup.id;

    upsertRecordFilter(newRecordFilter);

    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
  };

  return { addRootRecordFilterGroup };
};
