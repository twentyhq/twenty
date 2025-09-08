import styled from '@emotion/styled';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderAddColumnButton } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderAddColumnButton';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderLastColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastColumn';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

export const FIRST_TH_WIDTH = '10px';

const StyledTableHead = styled.div<{
  stickyColumnZIndex: number;
  normalColumnZIndex: number;
  entireRowZIndex: number;
}>`
  cursor: pointer;

  display: flex;
  flex-direction: row;
  align-items: center;

  height: 32px;
  background-color: ${({ theme }) => theme.background.primary};

  div.header-cell:nth-of-type(n + 3) {
    z-index: ${({ normalColumnZIndex }) => normalColumnZIndex};
  }

  div.header-cell:nth-of-type(1) {
    position: sticky;
    left: 0px;
    z-index: ${({ stickyColumnZIndex }) => stickyColumnZIndex};
    transition: 0.3s ease;
    background-color: ${({ theme }) => theme.background.primary};
  }

  div.header-cell:nth-of-type(2) {
    position: sticky;
    left: 17px;
    top: 0;
    z-index: ${({ stickyColumnZIndex }) => stickyColumnZIndex};
    transition: 0.3s ease;
    background-color: ${({ theme }) => theme.background.primary};
  }

  div.header-cell:nth-of-type(3) {
    position: sticky;
    left: 49px;
    right: 0;
    z-index: ${({ stickyColumnZIndex }) => stickyColumnZIndex};
    transition: 0.3s ease;
    background-color: ${({ theme }) => theme.background.primary};

    // &::after {
    //   content: '';
    //   position: absolute;
    //   top: -1px;
    //   height: calc(100% + 2px);
    //   width: 4px;
    //   right: 0px;
    //   box-shadow: ${({ theme }) => theme.boxShadow.light};
    //   clip-path: inset(0px -4px 0px 0px);
    // }

    @media (max-width: ${MOBILE_VIEWPORT}px) {
      width: 38px;
      max-width: 38px;
      min-width: 38px;
    }
  }

  position: sticky;
  top: 0px;
  z-index: ${({ entireRowZIndex }) => entireRowZIndex};
`;

export const RecordTableHeader = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const isRecordTableScrolledHorizontally = useRecoilComponentValue(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const isRecordTableScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const computedStickyColumnZIndex =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.scrolledBothVerticallyAndHorizontally.headerColumnsSticky
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.scrolledHorizontallyOnly.headerColumnsSticky
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.scrolledVerticallyOnly.headerColumnsSticky
          : TABLE_Z_INDEX.noScrollAtAll.headerColumnsSticky;

  const computedNormalColumnZIndex =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.scrolledBothVerticallyAndHorizontally.headerColumnsNormal
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.scrolledHorizontallyOnly.headerColumnsNormal
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.scrolledVerticallyOnly.headerColumnsNormal
          : TABLE_Z_INDEX.noScrollAtAll.headerColumnsNormal;

  const computedHeaderRowZIndex =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.scrolledBothVerticallyAndHorizontally.headerRow
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.scrolledHorizontallyOnly.headerRow
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.scrolledVerticallyOnly.headerRow
          : TABLE_Z_INDEX.noScrollAtAll.headerRow;

  return (
    <StyledTableHead
      id="record-table-header"
      data-select-disable
      stickyColumnZIndex={computedStickyColumnZIndex}
      normalColumnZIndex={computedNormalColumnZIndex}
      entireRowZIndex={computedHeaderRowZIndex}
    >
      <RecordTableHeaderDragDropColumn />
      <RecordTableHeaderCheckboxColumn />
      {visibleRecordFields.map((recordField) => (
        <RecordTableHeaderCell
          key={recordField.fieldMetadataItemId}
          recordField={recordField}
        />
      ))}
      <RecordTableHeaderAddColumnButton />
      <RecordTableHeaderLastColumn />
    </StyledTableHead>
  );
};
