import { type PageLayoutBreakpoint } from '@/page-layout/constants/PageLayoutBreakpoints';
import { PAGE_LAYOUT_GRID_OVERLAY_Z_INDEX } from '@/page-layout/constants/PageLayoutGridOverlayZIndex';
import { useCreateWidgetFromClick } from '@/page-layout/hooks/useCreateWidgetFromClick';
import { pageLayoutCurrentBreakpointComponentState } from '@/page-layout/states/pageLayoutCurrentBreakpointComponentState';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutSelectedCellsComponentState } from '@/page-layout/states/pageLayoutSelectedCellsComponentState';
import { calculateGridCellPosition } from '@/page-layout/utils/calculateGridCellPosition';
import { calculateTotalGridRows } from '@/page-layout/utils/calculateTotalGridRows';
import { generateCellId } from '@/page-layout/utils/generateCellId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useMemo } from 'react';

const StyledGridOverlay = styled.div<{
  isDragSelecting?: boolean;
  breakpoint: PageLayoutBreakpoint;
}>`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  left: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  bottom: ${({ theme }) => theme.spacing(2)};
  display: grid;
  grid-template-columns: ${({ breakpoint }) =>
    breakpoint === 'mobile' ? '1fr' : 'repeat(12, 1fr)'};
  grid-auto-rows: 55px;
  gap: ${({ theme }) => theme.spacing(2)};
  pointer-events: ${({ isDragSelecting }) =>
    isDragSelecting ? 'auto' : 'none'};
  z-index: ${PAGE_LAYOUT_GRID_OVERLAY_Z_INDEX};
`;

const StyledGridCell = styled.div<{ isSelected?: boolean }>`
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.color.blue3 : 'transparent'};
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue7 : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border-color: ${({ theme }) => theme.border.color.medium};
  }
`;

export const PageLayoutGridOverlay = () => {
  const pageLayoutCurrentBreakpoint = useRecoilComponentValue(
    pageLayoutCurrentBreakpointComponentState,
  );

  const pageLayoutSelectedCells = useRecoilComponentValue(
    pageLayoutSelectedCellsComponentState,
  );

  const pageLayoutCurrentLayouts = useRecoilComponentValue(
    pageLayoutCurrentLayoutsComponentState,
  );

  const activeTabId = useRecoilComponentValue(activeTabIdComponentState);

  const { createWidgetFromClick } = useCreateWidgetFromClick();

  const numberOfRows = useMemo(() => {
    const currentTabLayouts = pageLayoutCurrentLayouts[activeTabId ?? ''] || {
      desktop: [],
      mobile: [],
    };
    return calculateTotalGridRows(currentTabLayouts);
  }, [pageLayoutCurrentLayouts, activeTabId]);

  const isPageLayoutCurrentBreakpointMobile =
    pageLayoutCurrentBreakpoint === 'mobile';

  const numberOfColumns = pageLayoutCurrentBreakpoint === 'mobile' ? 1 : 12;

  return (
    <StyledGridOverlay
      isDragSelecting={!isPageLayoutCurrentBreakpointMobile}
      breakpoint={pageLayoutCurrentBreakpoint}
    >
      {Array.from(
        {
          length: numberOfColumns * numberOfRows,
        },
        (_, i) => {
          const { column, row } = calculateGridCellPosition({
            index: i,
            numberOfColumns,
          });
          const cellId = generateCellId(column, row);
          return (
            <StyledGridCell
              key={i}
              data-selectable-id={cellId}
              isSelected={pageLayoutSelectedCells.has(cellId)}
              onClick={() => createWidgetFromClick(cellId)}
            />
          );
        },
      )}
    </StyledGridOverlay>
  );
};
