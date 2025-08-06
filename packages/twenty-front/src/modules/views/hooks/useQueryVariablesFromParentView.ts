import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { getQueryVariablesFromFiltersAndSorts } from '../utils/getQueryVariablesFromFiltersAndSorts';

export const useQueryVariablesFromParentView = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const recordShowParentView = useRecoilComponentValue(
    contextStoreRecordShowParentViewComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const { filter, orderBy } = getQueryVariablesFromFiltersAndSorts({
    recordFilterGroups: recordShowParentView?.parentViewFilterGroups ?? [],
    recordFilters: recordShowParentView?.parentViewFilters ?? [],
    recordSorts: recordShowParentView?.parentViewSorts ?? [],
    objectMetadataItem,
    filterValueDependencies,
  });

  return {
    filter,
    orderBy,
  };
};
