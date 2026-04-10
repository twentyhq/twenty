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
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey, PageLayoutType } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type PageLayoutInitializationQueryEffectProps = {
  pageLayoutId: string;
};

const PageLayoutInitializationEffect = ({
  pageLayoutId,
  pageLayout,
}: {
  pageLayoutId: string;
  pageLayout: PageLayout | undefined;
}) => {
  const [pageLayoutIsInitialized, setPageLayoutIsInitialized] =
    useAtomComponentState(pageLayoutIsInitializedComponentState);

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

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
      }

      store.set(pageLayoutDraftComponentCallbackState, {
        id: layout.id,
        name: layout.name,
        type: layout.type,
        objectMetadataId: layout.objectMetadataId,
        tabs: layout.tabs,
        defaultTabToFocusOnMobileAndSidePanelId:
          layout.defaultTabToFocusOnMobileAndSidePanelId,
      });

      const tabLayouts = convertPageLayoutToTabLayouts(layout);
      store.set(pageLayoutCurrentLayoutsComponentCallbackState, tabLayouts);

      const isDashboardLayout = layout.type === PageLayoutType.DASHBOARD;

      if (isDashboardLayout) {
        const shouldEnterDashboardEditMode = isPageLayoutEmpty(layout);
        setIsPageLayoutInEditMode(shouldEnterDashboardEditMode);
      }
    },
    [
      pageLayoutCurrentLayoutsComponentCallbackState,
      pageLayoutDraftComponentCallbackState,
      pageLayoutPersistedComponentCallbackState,
      setIsPageLayoutInEditMode,
      store,
    ],
  );

  useEffect(() => {
    if (!pageLayoutIsInitialized && isDefined(pageLayout)) {
      initializePageLayout(pageLayout);
      setPageLayoutIsInitialized(true);
    }
  }, [
    initializePageLayout,
    pageLayoutIsInitialized,
    pageLayout,
    setPageLayoutIsInitialized,
  ]);

  return null;
};

const PageLayoutInitializationWithRelationWidgets = ({
  pageLayoutId,
  basePageLayout,
}: {
  pageLayoutId: string;
  basePageLayout: PageLayout | undefined;
}) => {
  const pageLayout = usePageLayoutWithRelationWidgets(basePageLayout);

  return (
    <PageLayoutInitializationEffect
      pageLayoutId={pageLayoutId}
      pageLayout={pageLayout}
    />
  );
};

// oxlint-disable-next-line twenty/effect-components
export const PageLayoutInitializationQueryEffect = ({
  pageLayoutId,
}: PageLayoutInitializationQueryEffectProps) => {
  const { layoutType } = useLayoutRenderingContext();

  const featureFlags = useFeatureFlagsMap();
  const isRecordPageLayoutEditingEnabled =
    featureFlags[FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED];

  const basePageLayout = useBasePageLayout(pageLayoutId);

  const needsRelationWidgets =
    layoutType === PageLayoutType.RECORD_PAGE &&
    !isRecordPageLayoutEditingEnabled;

  if (needsRelationWidgets) {
    return (
      <PageLayoutInitializationWithRelationWidgets
        pageLayoutId={pageLayoutId}
        basePageLayout={basePageLayout}
      />
    );
  }

  return (
    <PageLayoutInitializationEffect
      pageLayoutId={pageLayoutId}
      pageLayout={basePageLayout}
    />
  );
};
