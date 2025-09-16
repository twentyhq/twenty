import { type PageLayoutBreakpoint } from '@/page-layout/constants/PageLayoutBreakpoints';
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
  z-index: 0;
`;

const StyledGridCell = styled.div<{ isSelected?: boolean }>`
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.adaptiveColors.blue1 : 'transparent'};
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.adaptiveColors.blue3 : theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
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
            />
          );
        },
      )}
    </StyledGridOverlay>
  );
};
