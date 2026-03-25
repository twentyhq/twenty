import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { PageLayoutContent } from '@/page-layout/components/PageLayoutContent';
import { PageLayoutSetup } from '@/page-layout/components/PageLayoutSetup';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { usePageLayoutTabWithVisibleWidgetsOrThrow } from '@/page-layout/hooks/usePageLayoutTabWithVisibleWidgetsOrThrow';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { getTabLayoutMode } from '@/page-layout/utils/getTabLayoutMode';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

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
  return (
    <PageLayoutSetup pageLayoutId={pageLayoutId}>
      <PageLayoutSingleTabRendererContent />
    </PageLayoutSetup>
  );
};
