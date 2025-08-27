import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { coreViewsState } from '@/views/states/coreViewState';
import { type View } from '@/views/types/View';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { extractFeatureFlagMapFromWorkspace } from '@/workspace/utils/extractFeatureFlagMapFromWorkspace';
import { selectorFamily } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

export const prefetchViewFromViewIdFamilySelector = selectorFamily<
  View | undefined,
  { viewId: string }
>({
  key: 'prefetchViewFromViewIdFamilySelector',
  get:
    ({ viewId }) =>
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

      return views?.find((view) => view.id === viewId);
    },
});
