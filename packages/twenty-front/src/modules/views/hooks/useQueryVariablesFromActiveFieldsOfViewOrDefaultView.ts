import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import { getQueryVariablesFromView } from '@/views/utils/getQueryVariablesFromView';

export const useQueryVariablesFromActiveFieldsOfViewOrDefaultView = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { view } = useViewOrDefaultViewFromPrefetchedViews({
    objectMetadataItemId: objectMetadataItem.id,
  });

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const { filterValueDependencies } = useFilterValueDependencies();

  const { filter, orderBy } = getQueryVariablesFromView({
    fieldMetadataItems: activeFieldMetadataItems,
    objectMetadataItem,
    view,
    filterValueDependencies,
  });

  return {
    filter,
    orderBy,
  };
};
