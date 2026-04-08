import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FindOnePageLayoutDocument } from '~/generated-metadata/graphql';

import { useExitLayoutCustomizationMode } from '@/layout-customization/hooks/useExitLayoutCustomizationMode';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { evictViewMetadataForViewIds } from '@/page-layout/utils/evictViewMetadataForViewIds';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useRefreshPageLayoutAfterReset = (
  pageLayoutIdFromProps: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const client = useApolloClient();
  const store = useStore();

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);
  const { exitLayoutCustomizationMode } = useExitLayoutCustomizationMode();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();

  const pageLayoutPersistedState = useAtomComponentStateCallbackState(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useAtomComponentStateCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const refreshPageLayoutAfterReset = useCallback(
    async (collectAffectedViewIds: (layout: PageLayout) => Set<string>) => {
      const { data } = await client.query({
        query: FindOnePageLayoutDocument,
        variables: { id: pageLayoutId },
        fetchPolicy: 'network-only',
      });

      let affectedViewIds = new Set<string>();

      if (isDefined(data?.getPageLayout)) {
        const freshLayout = transformPageLayout(data.getPageLayout);

        affectedViewIds = collectAffectedViewIds(freshLayout);

        store.set(pageLayoutPersistedState, freshLayout);
        store.set(pageLayoutDraftState, toDraftPageLayout(freshLayout));
        store.set(
          pageLayoutCurrentLayoutsState,
          convertPageLayoutToTabLayouts(freshLayout),
        );
      }

      setIsPageLayoutInEditMode(false);
      exitLayoutCustomizationMode();
      evictViewMetadataForViewIds(store, affectedViewIds);
      invalidateMetadataStore();
    },
    [
      client,
      pageLayoutId,
      store,
      pageLayoutPersistedState,
      pageLayoutDraftState,
      pageLayoutCurrentLayoutsState,
      setIsPageLayoutInEditMode,
      exitLayoutCustomizationMode,
      invalidateMetadataStore,
    ],
  );

  return { refreshPageLayoutAfterReset };
};
