import { PageLayoutInitializationEffect } from '@/page-layout/components/PageLayoutInitializationEffect';
import { EMPTY_LAYOUT } from '@/page-layout/constants/EmptyLayout';

import { pageLayoutCurrentLayoutsState } from '@/page-layout/states/pageLayoutCurrentLayoutsState';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { type Widget } from '@/page-layout/widgets/types/Widget';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';

import { PageLayoutGridLayout } from '@/page-layout/components/PageLayoutGridLayout';
import { useMemo } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useRecoilValue } from 'recoil';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

type PageLayoutRendererProps = {
  pageLayout: PageLayoutWithData;
};

export const PageLayoutRenderer = ({ pageLayout }: PageLayoutRendererProps) => {
  const pageLayoutCurrentLayouts = useRecoilValue(
    pageLayoutCurrentLayoutsState,
  );

  const activeTabId = useRecoilComponentValue(activeTabIdComponentState);

  const activeTabWidgets = pageLayout.tabs.find(
    (tab) => tab.id === activeTabId,
  )?.widgets;

  const layouts = useMemo(() => {
    if (!activeTabId) return EMPTY_LAYOUT;
    return pageLayoutCurrentLayouts[activeTabId] || EMPTY_LAYOUT;
  }, [activeTabId, pageLayoutCurrentLayouts]);

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: pageLayout.id }}
    >
      <PageLayoutInitializationEffect
        isEditMode={false}
        pageLayout={pageLayout}
      />
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
  );
};
