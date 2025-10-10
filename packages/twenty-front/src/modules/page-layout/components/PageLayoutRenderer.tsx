import { PageLayoutInitializationQueryEffect } from '@/page-layout/components/PageLayoutInitializationQueryEffect';

import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { PageLayoutType } from '~/generated/graphql';

type PageLayoutRendererProps = {
  pageLayoutId: string;
  onInitialized?: (pageLayout: PageLayout) => void;
};

export const PageLayoutRenderer = ({
  pageLayoutId,
  onInitialized,
}: PageLayoutRendererProps) => {
  return (
    <LayoutRenderingProvider
      value={{
        targetRecord: undefined,
        layoutType: PageLayoutType.DASHBOARD,
        isInRightDrawer: false,
      }}
    >
      <PageLayoutComponentInstanceContext.Provider
        value={{
          instanceId: pageLayoutId,
        }}
      >
        <TabListComponentInstanceContext.Provider
          value={{
            instanceId: getTabListInstanceIdFromPageLayoutId(pageLayoutId),
          }}
        >
          <PageLayoutInitializationQueryEffect
            pageLayoutId={pageLayoutId}
            onInitialized={onInitialized}
          />
          <PageLayoutRendererContent />
        </TabListComponentInstanceContext.Provider>
      </PageLayoutComponentInstanceContext.Provider>
    </LayoutRenderingProvider>
  );
};
