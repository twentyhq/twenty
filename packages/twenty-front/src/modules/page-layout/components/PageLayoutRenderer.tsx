import { PageLayoutContextStoreEffect } from '@/page-layout/components/PageLayoutContextStoreEffect';
import { PageLayoutInitializationEffect } from '@/page-layout/components/PageLayoutInitializationEffect';

import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import styled from '@emotion/styled';

import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

type PageLayoutRendererProps = {
  pageLayout: PageLayoutWithData;
};

export const PageLayoutRenderer = ({ pageLayout }: PageLayoutRendererProps) => {
  return (
    <>
      <PageLayoutContextStoreEffect pageLayoutId={pageLayout.id} />
      <PageLayoutInitializationEffect pageLayout={pageLayout} />
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
          <StyledTabList
            tabs={pageLayout.tabs}
            behaveAsLinks={false}
            componentInstanceId={getTabListInstanceIdFromPageLayoutId(
              pageLayout.id,
            )}
          />
          <PageLayoutGridLayout />
        </TabListComponentInstanceContext.Provider>
      </PageLayoutComponentInstanceContext.Provider>
    </>
  );
};
