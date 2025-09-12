import { PageLayoutContextStoreEffect } from '@/page-layout/components/PageLayoutContextStoreEffect';
import { PageLayoutInitializationEffect } from '@/page-layout/components/PageLayoutInitializationEffect';
import { EMPTY_LAYOUT } from '@/page-layout/constants/EmptyLayout';

import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { type Widget } from '@/page-layout/widgets/types/Widget';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';

import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { getTabListInstanceIdFromPageLayoutId } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutId';
import { useMemo } from 'react';
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
  const pageLayoutCurrentLayouts = useRecoilComponentValue(
    pageLayoutCurrentLayoutsComponentState,
    pageLayout.id,
  );

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    pageLayout.id,
  );

  const activeTabWidgets = pageLayout.tabs.find(
    (tab) => tab.id === activeTabId,
  )?.widgets;

  const layouts = useMemo(() => {
    if (!activeTabId) return EMPTY_LAYOUT;
    return pageLayoutCurrentLayouts[activeTabId] || EMPTY_LAYOUT;
  }, [activeTabId, pageLayoutCurrentLayouts]);

  return (
    <>
      <PageLayoutContextStoreEffect pageLayoutId={pageLayout.id} />
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
          <PageLayoutInitializationEffect pageLayout={pageLayout} />
          <StyledTabList
            tabs={pageLayout.tabs}
            behaveAsLinks={false}
            componentInstanceId={pageLayout.id}
          />
          <PageLayoutGridLayout layouts={layouts}>
            {activeTabWidgets?.map((widget) => (
              <div key={widget.id} data-select-disable="true">
                <WidgetRenderer widget={widget as Widget} />
              </div>
            ))}
          </PageLayoutGridLayout>
        </TabListComponentInstanceContext.Provider>
      </PageLayoutComponentInstanceContext.Provider>
    </>
  );
};
