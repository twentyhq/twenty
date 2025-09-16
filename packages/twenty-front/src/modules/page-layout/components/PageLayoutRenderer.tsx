import { PageLayoutInitializationQueryEffect } from '@/page-layout/components/PageLayoutInitializationQueryEffect';

import { PageLayoutRendererContent } from '@/page-layout/components/PageLayoutRendererContent';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

type PageLayoutRendererProps = {
  pageLayout: PageLayoutWithData;
};

export const PageLayoutRenderer = ({ pageLayout }: PageLayoutRendererProps) => {
  return (
    <PageLayoutComponentInstanceContext.Provider
      value={{
        instanceId: pageLayout.id,
      }}
    >
      <TabListComponentInstanceContext.Provider
        value={{
          instanceId: getTabListInstanceIdFromPageLayoutId(pageLayout.id),
        }}
      >
        <PageLayoutInitializationQueryEffect pageLayout={pageLayout} />
        <PageLayoutRendererContent />
      </TabListComponentInstanceContext.Provider>
    </PageLayoutComponentInstanceContext.Provider>
  );
};
