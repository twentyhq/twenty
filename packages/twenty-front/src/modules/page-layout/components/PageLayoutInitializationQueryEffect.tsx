import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { recordLayoutDraftStoreByPageLayoutIdState } from '@/app/states/recordLayoutDraftStoreByPageLayoutIdState';
import { useBasePageLayout } from '@/page-layout/hooks/useBasePageLayout';
import { usePageLayoutWithRelationWidgets } from '@/page-layout/hooks/usePageLayoutWithRelationWidgets';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { isPageLayoutEmpty } from '@/page-layout/utils/isPageLayoutEmpty';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type PageLayoutInitializationQueryEffectProps = {
  pageLayoutId: string;
};

export const PageLayoutInitializationQueryEffect = ({
  pageLayoutId,
}: PageLayoutInitializationQueryEffectProps) => {
  const [pageLayoutIsInitialized, setPageLayoutIsInitialized] =
    useAtomComponentState(pageLayoutIsInitializedComponentState);

  const basePageLayout = useBasePageLayout(pageLayoutId);

  const pageLayout = usePageLayoutWithRelationWidgets(basePageLayout);

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const pageLayoutPersistedComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutPersistedComponentState);

  const pageLayoutDraftComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutDraftComponentState);

  const pageLayoutCurrentLayoutsComponentCallbackState =
    useAtomComponentStateCallbackState(pageLayoutCurrentLayoutsComponentState);

  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );

  const store = useStore();

  const initializePageLayout = useCallback(
    (layout: PageLayout) => {
      const isRecordPageLayout = layout.type === PageLayoutType.RECORD_PAGE;

      const isCustomizationDraftAlreadyRegistered = isDefined(
        store.get(recordLayoutDraftStoreByPageLayoutIdState.atom)[layout.id],
      );

      if (
        isRecordPageLayout &&
        isLayoutCustomizationActive &&
        isCustomizationDraftAlreadyRegistered
      ) {
        return;
      }

      const currentPersisted = store.get(
        pageLayoutPersistedComponentCallbackState,
      );

      if (!isDeeplyEqual(layout, currentPersisted)) {
        store.set(pageLayoutPersistedComponentCallbackState, layout);
      }

      store.set(pageLayoutDraftComponentCallbackState, {
        id: layout.id,
        name: layout.name,
        type: layout.type,
        objectMetadataId: layout.objectMetadataId,
        tabs: layout.tabs,
      });

      const tabLayouts = convertPageLayoutToTabLayouts(layout);
      store.set(pageLayoutCurrentLayoutsComponentCallbackState, tabLayouts);

      if (!isRecordPageLayout) {
        const shouldEnterDashboardEditMode = isPageLayoutEmpty(layout);
        setIsPageLayoutInEditMode(shouldEnterDashboardEditMode);
      }
    },
    [
      pageLayoutCurrentLayoutsComponentCallbackState,
      pageLayoutDraftComponentCallbackState,
      pageLayoutPersistedComponentCallbackState,
      isLayoutCustomizationActive,
      setIsPageLayoutInEditMode,
      store,
    ],
  );

  useEffect(() => {
    if (
      !isLayoutCustomizationActive &&
      !pageLayoutIsInitialized &&
      isDefined(pageLayout)
    ) {
      initializePageLayout(pageLayout);
      setPageLayoutIsInitialized(true);
    }
  }, [
    isLayoutCustomizationActive,
    initializePageLayout,
    pageLayoutIsInitialized,
    pageLayout,
    setPageLayoutIsInitialized,
  ]);

  useEffect(() => {
    if (isLayoutCustomizationActive && isDefined(pageLayout)) {
      initializePageLayout(pageLayout);
      setPageLayoutIsInitialized(true);
    }
  }, [
    initializePageLayout,
    isLayoutCustomizationActive,
    pageLayout,
    setPageLayoutIsInitialized,
  ]);

  return null;
};
