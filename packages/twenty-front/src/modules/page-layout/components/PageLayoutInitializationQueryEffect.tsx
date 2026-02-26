import { useBasePageLayout } from '@/page-layout/hooks/useBasePageLayout';
import { usePageLayoutWithRelationWidgets } from '@/page-layout/hooks/usePageLayoutWithRelationWidgets';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type PageLayoutInitializationQueryEffectProps = {
  pageLayoutId: string;
  onInitialized?: (pageLayout: PageLayout) => void;
};

export const PageLayoutInitializationQueryEffect = ({
  pageLayoutId,
  onInitialized,
}: PageLayoutInitializationQueryEffectProps) => {
  const [pageLayoutIsInitialized, setPageLayoutIsInitialized] =
    useAtomComponentState(pageLayoutIsInitializedComponentState);

  const basePageLayout = useBasePageLayout(pageLayoutId);

  const pageLayout = usePageLayoutWithRelationWidgets(basePageLayout);

  const pageLayoutPersistedComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutPersistedComponentState);

  const pageLayoutDraftComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutDraftComponentState);

  const pageLayoutCurrentLayoutsComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutCurrentLayoutsComponentState);

  const store = useStore();

  const initializePageLayout = useCallback(
    (layout: PageLayout) => {
      const currentPersisted = store.get(
        pageLayoutPersistedComponentCallbackState,
      );

      if (!isDeeplyEqual(layout, currentPersisted)) {
        store.set(pageLayoutPersistedComponentCallbackState, layout);
        store.set(pageLayoutDraftComponentCallbackState, {
          id: layout.id,
          name: layout.name,
          type: layout.type,
          objectMetadataId: layout.objectMetadataId,
          tabs: layout.tabs,
        });

        const tabLayouts = convertPageLayoutToTabLayouts(layout);
        store.set(pageLayoutCurrentLayoutsComponentCallbackState, tabLayouts);
      }
    },
    [
      pageLayoutCurrentLayoutsComponentCallbackState,
      pageLayoutDraftComponentCallbackState,
      pageLayoutPersistedComponentCallbackState,
      store,
    ],
  );

  useEffect(() => {
    if (!pageLayoutIsInitialized && isDefined(pageLayout)) {
      initializePageLayout(pageLayout);
      onInitialized?.(pageLayout);
      setPageLayoutIsInitialized(true);
    }
  }, [
    initializePageLayout,
    pageLayoutIsInitialized,
    pageLayout,
    onInitialized,
    setPageLayoutIsInitialized,
  ]);

  return null;
};
