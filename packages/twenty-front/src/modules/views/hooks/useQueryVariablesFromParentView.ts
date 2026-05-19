import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { fieldMetadataItemByIdMapSelector } from '@/object-metadata/states/fieldMetadataItemByIdMapSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getQueryVariablesFromFiltersAndSorts } from '@/views/utils/getQueryVariablesFromFiltersAndSorts';

export const useQueryVariablesFromParentView = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const fieldMetadataItemByIdMap = useAtomStateValue(
    fieldMetadataItemByIdMapSelector,
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
    findFieldMetadataItemById: (id) => fieldMetadataItemByIdMap.get(id),
    filterValueDependencies,
  });

  return {
    filter,
    orderBy,
  };
};
