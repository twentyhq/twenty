import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import { useQueryVariablesFromView } from './useQueryVariablesFromView';

export const useQueryVariablesFromActiveFieldsOfViewOrDefaultView = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { view } = useViewOrDefaultViewFromPrefetchedViews({
    objectMetadataItemId: objectMetadataItem.id,
  });

  const { filterValueDependencies } = useFilterValueDependencies();

  const { filter, orderBy } = useQueryVariablesFromView({
    objectMetadataItem,
    view,
    filterValueDependencies,
  });

  return {
    filter,
    orderBy,
  };
};
