import { PageLayoutGridLayoutDragSelector } from '@/page-layout/components/PageLayoutGridLayoutDragSelector';
import { PageLayoutGridOverlay } from '@/page-layout/components/PageLayoutGridOverlay';
import {
  PAGE_LAYOUT_CONFIG,
  type PageLayoutBreakpoint,
} from '@/page-layout/constants/PageLayoutBreakpoints';
import { usePageLayoutHandleLayoutChange } from '@/page-layout/hooks/usePageLayoutHandleLayoutChange';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { pageLayoutCurrentBreakpointComponentState } from '@/page-layout/states/pageLayoutCurrentBreakpointComponentState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import styled from '@emotion/styled';
import { useRef } from 'react';
import {
  Responsive,
  WidthProvider,
  type Layouts,
  type ResponsiveProps,
} from 'react-grid-layout';

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

type ExtendedResponsiveProps = ResponsiveProps & {
  maxCols?: number;
  preventCollision?: boolean;
};

const ResponsiveGridLayout = WidthProvider(
  Responsive,
) as React.ComponentType<ExtendedResponsiveProps>;

type PageLayoutGridLayoutProps = {
  layouts: Layouts;
  children: React.ReactNode;
};

export const PageLayoutGridLayout = ({
  layouts,
  children,
}: PageLayoutGridLayoutProps) => {
  const setPageLayoutCurrentBreakpoint = useSetRecoilComponentState(
    pageLayoutCurrentBreakpointComponentState,
  );

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const activeTabId = useRecoilComponentValue(activeTabIdComponentState);

  const { handleLayoutChange } = usePageLayoutHandleLayoutChange(
    activeTabId ?? undefined,
  );

  const isPageLayoutInEditMode = useRecoilComponentValue(
    isPageLayoutInEditModeComponentState,
  );

  return (
    <StyledGridContainer ref={gridContainerRef}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={PAGE_LAYOUT_CONFIG.breakpoints}
        cols={PAGE_LAYOUT_CONFIG.columns}
        rowHeight={55}
        maxCols={12}
        containerPadding={[0, 0]}
        margin={[8, 8]}
        isDraggable={isPageLayoutInEditMode}
        isResizable={isPageLayoutInEditMode}
        draggableHandle=".drag-handle"
        compactType="vertical"
        preventCollision={false}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={(newBreakpoint) =>
          setPageLayoutCurrentBreakpoint(newBreakpoint as PageLayoutBreakpoint)
        }
      >
        {children}
        {isPageLayoutInEditMode && (
          <>
            <PageLayoutGridOverlay />
            <PageLayoutGridLayoutDragSelector
              gridContainerRef={gridContainerRef}
            />
          </>
        )}
      </ResponsiveGridLayout>
    </StyledGridContainer>
  );
};
