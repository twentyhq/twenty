import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import { getQueryVariablesFromView } from '@/views/utils/getQueryVariablesFromView';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useQueryVariablesFromActiveFieldsOfViewOrDefaultView = ({
  objectMetadataItem,
  viewId,
  currentWorkspaceMemberId,
}: {
  objectMetadataItem: ObjectMetadataItem;
  viewId: string | null | undefined;
  currentWorkspaceMemberId?: string;
}) => {
  const { view } = useViewOrDefaultViewFromPrefetchedViews({
    objectMetadataItemId: objectMetadataItem.id,
    viewId,
  });

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const isJsonFilterEnabled = useIsFeatureEnabled('IS_JSON_FILTER_ENABLED');

  const { filter, orderBy } = getQueryVariablesFromView({
    fieldMetadataItems: activeFieldMetadataItems,
    objectMetadataItem,
    view,
    isJsonFilterEnabled,
    currentWorkspaceMemberId,
  });

  return {
    filter,
    orderBy,
  };
};
