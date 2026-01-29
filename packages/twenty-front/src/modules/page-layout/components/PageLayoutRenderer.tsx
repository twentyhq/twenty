import { PageLayoutInitializationQueryEffect } from '@/page-layout/components/PageLayoutInitializationQueryEffect';
import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { isPageLayoutEmpty } from '@/page-layout/utils/isPageLayoutEmpty';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { PageLayoutType } from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

type PageLayoutRendererProps = {
  pageLayoutId: string;
};

export const PageLayoutRenderer = ({
  pageLayoutId,
}: PageLayoutRendererProps) => {
  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();

  const onInitialized = (pageLayout: PageLayout) => {
    if (isPageLayoutEmpty(pageLayout)) {
      setIsPageLayoutInEditMode(true);
    } else {
      setIsPageLayoutInEditMode(false);
    }
  };

  // Include record ID in tab instance ID to prevent tab synchronization between different records
  // Only for RECORD_PAGE layouts, as DASHBOARD layouts are standalone
  const recordId =
    layoutType === PageLayoutType.RECORD_PAGE
      ? targetRecordIdentifier?.id
      : undefined;
  const tabListInstanceId = isDefined(recordId)
    ? `${getTabListInstanceIdFromPageLayoutId(pageLayoutId)}-${recordId}`
    : getTabListInstanceIdFromPageLayoutId(pageLayoutId);

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
        <PageLayoutInitializationQueryEffect
          pageLayoutId={pageLayoutId}
          onInitialized={onInitialized}
        />
        <PageLayoutRendererContent />
      </TabListComponentInstanceContext.Provider>
    </PageLayoutComponentInstanceContext.Provider>
  );
};
