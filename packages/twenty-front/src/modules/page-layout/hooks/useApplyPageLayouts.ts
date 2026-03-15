import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { splitPageLayoutWithRelated } from '@/metadata-store/utils/splitPageLayoutWithRelated';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { recordPageLayoutsState } from '@/page-layout/states/recordPageLayoutsState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type PageLayout as PageLayoutGenerated } from '~/generated-metadata/graphql';

export const useApplyPageLayouts = () => {
  const store = useStore();
  const { updateDraft, applyChanges } = useMetadataStore();

  const applyPageLayouts = useCallback(
    (pageLayouts: PageLayoutGenerated[]) => {
      const transformedPageLayouts = pageLayouts.map(transformPageLayout);

      for (const pageLayout of transformedPageLayouts) {
        store.set(
          pageLayoutPersistedComponentState.atomFamily({
            instanceId: pageLayout.id,
          }),
          pageLayout,
        );
        store.set(
          pageLayoutCurrentLayoutsComponentState.atomFamily({
            instanceId: pageLayout.id,
          }),
          convertPageLayoutToTabLayouts(pageLayout),
        );
      }

      store.set(recordPageLayoutsState.atom, transformedPageLayouts);

      const { flatPageLayouts, flatPageLayoutTabs, flatPageLayoutWidgets } =
        splitPageLayoutWithRelated(transformedPageLayouts);

      updateDraft('pageLayouts', flatPageLayouts);
      updateDraft('pageLayoutTabs', flatPageLayoutTabs);
      updateDraft('pageLayoutWidgets', flatPageLayoutWidgets);
      applyChanges();
    },
    [store, updateDraft, applyChanges],
  );

  return {
    applyPageLayouts,
  };
};
