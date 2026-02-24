import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { getQueryVariablesFromFiltersAndSorts } from '@/views/utils/getQueryVariablesFromFiltersAndSorts';

export const useQueryVariablesFromParentView = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const recordShowParentView = useRecoilComponentValueV2(
    contextStoreRecordShowParentViewComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const { filter, orderBy } = getQueryVariablesFromFiltersAndSorts({
    recordFilterGroups: recordShowParentView?.parentViewFilterGroups ?? [],
    recordFilters: recordShowParentView?.parentViewFilters ?? [],
    recordSorts: recordShowParentView?.parentViewSorts ?? [],
    objectMetadataItem,
    objectMetadataItems,
    filterValueDependencies,
  });

  return {
    filter,
    orderBy,
  };
};
