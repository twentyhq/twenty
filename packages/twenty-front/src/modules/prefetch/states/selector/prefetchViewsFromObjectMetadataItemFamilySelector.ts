import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { coreViewsState } from '@/views/states/coreViewState';
import { type View } from '@/views/types/View';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { extractFeatureFlagMapFromWorkspace } from '@/workspace/utils/extractFeatureFlagMapFromWorkspace';
import { selectorFamily } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

export const prefetchViewsFromObjectMetadataItemFamilySelector = selectorFamily<
  View[],
  { objectMetadataItemId: string }
>({
  key: 'prefetchViewsFromObjectMetadataItemFamilySelector',
  get:
    ({ objectMetadataItemId }) =>
    ({ get }) => {
      const prefetchedViews = get(prefetchViewsState);
      const coreViews = get(coreViewsState);

      const currentWorkspace = get(currentWorkspaceState);
      const featureFlags = extractFeatureFlagMapFromWorkspace(currentWorkspace);

      const isCoreViewEnabled =
        featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

      const views = isCoreViewEnabled
        ? coreViews.map(convertCoreViewToView)
        : prefetchedViews;

      const filteredViews = views.filter(
        (view) => view.objectMetadataId === objectMetadataItemId,
      );

      return filteredViews.sort((a, b) => a.position - b.position);
    },
});
