import { PageLayoutInitializationEffect } from '@/page-layout/components/PageLayoutInitializationEffect';
import { EMPTY_LAYOUT } from '@/page-layout/constants/EmptyLayout';
import {
  PAGE_LAYOUT_CONFIG,
  type PageLayoutBreakpoint,
} from '@/page-layout/constants/PageLayoutBreakpoints';
import { pageLayoutCurrentBreakpointState } from '@/page-layout/states/pageLayoutCurrentBreakpointState';
import { pageLayoutCurrentLayoutsState } from '@/page-layout/states/pageLayoutCurrentLayoutsState';
import { WidgetRenderer } from '@/page-layout/widgets/components/WidgetRenderer';
import { type Widget } from '@/page-layout/widgets/types/Widget';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useMemo } from 'react';
import {
  Responsive,
  WidthProvider,
  type ResponsiveProps,
} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useRecoilState, useRecoilValue } from 'recoil';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

const StyledGridContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  box-sizing: border-box;
  flex: 1;
  min-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  user-select: none;

  .react-grid-placeholder {
    background: ${({ theme }) => theme.adaptiveColors.blue3} !important;

    border-radius: ${({ theme }) => theme.border.radius.sm};
  }

  .react-grid-item:not(.react-draggable-dragging) {
    user-select: auto;
  }
`;

const StyledTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

type ExtendedResponsiveProps = ResponsiveProps & {
  maxCols?: number;
  preventCollision?: boolean;
};

const ResponsiveGridLayout = WidthProvider(
  Responsive,
) as React.ComponentType<ExtendedResponsiveProps>;

type PageLayoutRendererProps = {
  pageLayout: PageLayoutWithData;
};

type PageLayoutRendererContentProps = {
  pageLayout: PageLayoutWithData;
};

const PageLayoutRendererContent = ({
  pageLayout,
}: PageLayoutRendererContentProps) => {
  const [, setPageLayoutCurrentBreakpoint] = useRecoilState(
    pageLayoutCurrentBreakpointState,
  );

  const pageLayoutCurrentLayouts = useRecoilValue(
    pageLayoutCurrentLayoutsState,
  );

  const activeTabId = useRecoilComponentValue(activeTabIdComponentState);

  const activeTabWidgets = pageLayout.tabs.find(
    (tab) => tab.id === activeTabId,
  )?.widgets;

  const tabListTabs: SingleTabProps[] = useMemo(() => {
    return [...pageLayout.tabs]
      .sort((a, b) => a.position - b.position)
      .map((tab) => ({
        id: tab.id,
        title: tab.title,
      }));
  }, [pageLayout.tabs]);

  return (
    <>
      <PageLayoutInitializationEffect
        layoutId={pageLayout.id}
        isEditMode={false}
        pageLayout={pageLayout}
      />
      {pageLayout.tabs.length > 0 && (
        <StyledTabList
          tabs={tabListTabs}
          behaveAsLinks={false}
          componentInstanceId={pageLayout.id}
        />
      )}
      <StyledGridContainer>
        <ResponsiveGridLayout
          className="layout"
          layouts={
            !activeTabId
              ? EMPTY_LAYOUT
              : pageLayoutCurrentLayouts[activeTabId] || EMPTY_LAYOUT
          }
          breakpoints={PAGE_LAYOUT_CONFIG.breakpoints}
          cols={PAGE_LAYOUT_CONFIG.columns}
          rowHeight={55}
          maxCols={12}
          containerPadding={[0, 0]}
          margin={[8, 8]}
          isDraggable={false}
          isResizable={false}
          draggableHandle=".drag-handle"
          compactType="vertical"
          preventCollision={false}
          onBreakpointChange={(newBreakpoint) =>
            setPageLayoutCurrentBreakpoint(
              newBreakpoint as PageLayoutBreakpoint,
            )
          }
        >
          {activeTabWidgets?.map((widget) => (
            <div key={widget.id} data-select-disable="true">
              <WidgetRenderer widget={widget as Widget} />
            </div>
          ))}
        </ResponsiveGridLayout>
      </StyledGridContainer>
    </>
  );
};

export const PageLayoutRenderer = ({ pageLayout }: PageLayoutRendererProps) => {
  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: pageLayout.id }}
    >
      <PageLayoutRendererContent pageLayout={pageLayout} />
    </TabListComponentInstanceContext.Provider>
  );
};
