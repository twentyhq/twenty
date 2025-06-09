import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { getQueryVariablesFromView } from './useQueryVariablesFromView';

export const useQueryVariablesFromActiveFieldsOfViewOrDefaultView = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const recordShowParentView = useRecoilComponentValueV2(
    contextStoreRecordShowParentViewComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const { filter, orderBy } = getQueryVariablesFromView({
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
