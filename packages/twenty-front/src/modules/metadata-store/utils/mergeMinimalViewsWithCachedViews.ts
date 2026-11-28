import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FindMinimalMetadataQuery } from '@/metadata-store/types/MinimalMetadata';

export const mergeMinimalViewsWithCachedViews = ({
  minimalViews,
  cachedViews,
}: {
  minimalViews: FindMinimalMetadataQuery['minimalMetadata']['views'];
  cachedViews: FlatView[];
}): FlatView[] => {
  const cachedViewsById = new Map(cachedViews.map((view) => [view.id, view]));

  return minimalViews.map(
    ({ __typename: _typename, ...minimalView }) =>
      ({
        ...cachedViewsById.get(minimalView.id),
        ...minimalView,
      }) as FlatView,
  );
};
