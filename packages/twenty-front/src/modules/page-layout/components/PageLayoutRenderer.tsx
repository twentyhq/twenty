import { PageLayoutInitializationQueryEffect } from '@/page-layout/components/PageLayoutInitializationQueryEffect';

import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type PageLayoutWithData } from '@/page-layout/types/pageLayoutTypes';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

type PageLayoutRendererProps = {
  pageLayoutId: string;
  onInitialized: (pageLayout: PageLayoutWithData) => void;
};

export const PageLayoutRenderer = ({
  pageLayoutId,
  onInitialized,
}: PageLayoutRendererProps) => {
  return (
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
  );
};
