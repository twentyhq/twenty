import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { isRecordFilterAboutSoftDelete } from '@/object-record/record-filter/utils/isRecordFilterAboutSoftDelete';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getQueryVariablesFromFiltersAndSorts } from '@/views/utils/getQueryVariablesFromFiltersAndSorts';

export const useQueryVariablesFromParentView = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const contextStoreRecordShowParentView = useAtomComponentStateValue(
    contextStoreRecordShowParentViewComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const { filter, orderBy } = getQueryVariablesFromFiltersAndSorts({
    recordFilterGroups:
      contextStoreRecordShowParentView?.parentViewFilterGroups ?? [],
    recordFilters: contextStoreRecordShowParentView?.parentViewFilters ?? [],
    recordSorts: contextStoreRecordShowParentView?.parentViewSorts ?? [],
    objectMetadataItem,
    objectMetadataItems,
    fieldMetadataItems: flattenedFieldMetadataItems,
    filterValueDependencies,
  });

  const isSoftDeleteFilterActive =
    contextStoreRecordShowParentView?.parentViewFilters.some((recordFilter) =>
      isRecordFilterAboutSoftDelete({ recordFilter, objectMetadataItems }),
    ) ?? false;

  return {
    filter,
    orderBy,
    isSoftDeleteFilterActive,
  };
};
