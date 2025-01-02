import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useViewOrDefaultViewFromPrefetchedViews } from '@/views/hooks/useViewOrDefaultViewFromPrefetchedViews';
import { getQueryVariablesFromView } from '@/views/utils/getQueryVariablesFromView';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const useQueryVariablesFromActiveFieldsOfViewOrDefaultView = ({
  objectMetadataItem,
  viewId,
}: {
  objectMetadataItem: ObjectMetadataItem;
  viewId: string | null | undefined;
}) => {
  const { view } = useViewOrDefaultViewFromPrefetchedViews({
    objectMetadataItemId: objectMetadataItem.id,
    viewId,
  });

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const isJsonFilterEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsJsonFilterEnabled,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const { filter, orderBy } = getQueryVariablesFromView({
    fieldMetadataItems: activeFieldMetadataItems,
    objectMetadataItem,
    view,
    isJsonFilterEnabled,
    filterValueDependencies,
  });

  return {
    filter,
    orderBy,
  };
};
