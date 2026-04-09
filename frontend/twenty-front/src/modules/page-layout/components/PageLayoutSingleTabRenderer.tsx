import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutEditModeProvider } from '@/page-layout/components/PageLayoutEditModeProvider';
import { PageLayoutInitializationQueryEffect } from '@/page-layout/components/PageLayoutInitializationQueryEffect';
import { PageLayoutRecordPageCustomizationSessionRegistrationEffect } from '@/page-layout/components/PageLayoutRecordPageCustomizationSessionRegistrationEffect';
import { PageLayoutRelationWidgetsSyncEffect } from '@/page-layout/components/PageLayoutRelationWidgetsSyncEffect';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type PageLayoutSingleTabRendererProps = {
  pageLayoutId: string;
};

const PageLayoutSingleTabRendererContent = () => {
  const pageLayoutIsInitialized = useAtomComponentStateValue(
    pageLayoutIsInitializedComponentState,
  );

  if (!pageLayoutIsInitialized) {
    return null;
  }

  return <PageLayoutSingleTabRendererInner />;
};

const PageLayoutSingleTabRendererInner = () => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const targetRecordIdentifier = useTargetRecord();
  const { isInSidePanel } = useLayoutRenderingContext();

  const sortedTabs = sortTabsByPosition(currentPageLayout.tabs);
  const firstTab = sortedTabs[0];

  const firstTabWithVisibleWidgets = usePageLayoutTabWithVisibleWidgetsOrThrow(
    firstTab.id,
  );

  const layoutMode = getTabLayoutMode({
    tab: firstTabWithVisibleWidgets,
    pageLayoutType: currentPageLayout.type,
  });

  return (
    <>
      <SummaryCard
        objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
        objectRecordId={targetRecordIdentifier.id}
        isInSidePanel={isInSidePanel}
      />

      <PageLayoutContentProvider
        value={{
          tabId: firstTab.id,
          layoutMode,
        }}
      >
        <PageLayoutContent />
      </PageLayoutContentProvider>
    </>
  );
};

export const PageLayoutSingleTabRenderer = ({
  pageLayoutId,
}: PageLayoutSingleTabRendererProps) => {
  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();

  const featureFlags = useFeatureFlagsMap();
  const isRecordPageLayoutEditingEnabled =
    featureFlags[FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED];

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType,
    targetRecordIdentifier,
  });

  return (
    <PageLayoutComponentInstanceContext.Provider
      value={{
        instanceId: pageLayoutId,
      }}
    >
      <TabListComponentInstanceContext.Provider
        value={{
          instanceId: tabListInstanceId,
        }}
      >
        <PageLayoutEditModeProvider
          layoutType={layoutType}
          pageLayoutId={pageLayoutId}
        >
          <PageLayoutInitializationQueryEffect pageLayoutId={pageLayoutId} />
          <PageLayoutRecordPageCustomizationSessionRegistrationEffect />
          {!isRecordPageLayoutEditingEnabled && (
            <PageLayoutRelationWidgetsSyncEffect pageLayoutId={pageLayoutId} />
          )}
          <PageLayoutSingleTabRendererContent />
        </PageLayoutEditModeProvider>
      </TabListComponentInstanceContext.Provider>
    </PageLayoutComponentInstanceContext.Provider>
  );
};
