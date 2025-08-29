import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { coreViewsState } from '@/views/states/coreViewState';
import { type View } from '@/views/types/View';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { extractFeatureFlagMapFromWorkspace } from '@/workspace/utils/extractFeatureFlagMapFromWorkspace';
import { selector } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

export const favoriteViewsWithMinimalDataSelector = selector<
  Pick<View, 'id' | 'name' | 'objectMetadataId' | 'icon'>[]
>({
  key: 'favoriteViewsWithMinimalDataSelector',
  get: ({ get }) => {
    const prefetchedViews = get(prefetchViewsState);
    const coreViews = get(coreViewsState);

    const currentWorkspace = get(currentWorkspaceState);
    const featureFlags = extractFeatureFlagMapFromWorkspace(currentWorkspace);

    const isCoreViewEnabled = featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

    const views = isCoreViewEnabled
      ? coreViews.map(convertCoreViewToView)
      : prefetchedViews;
    return views.map((view) => ({
      id: view.id,
      name: view.name,
      objectMetadataId: view.objectMetadataId,
      icon: view.icon,
    }));
  },
});
