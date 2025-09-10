import { useRecordTableLastColumnWidthToFill } from '@/object-record/record-table/hooks/useRecordTableLastColumnWidthToFill';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';

const StyledLastColumnHeader = styled.div<{ width: number }>`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};

  background-color: ${({ theme }) => theme.background.primary};
  border-left: none !important;
  color: ${({ theme }) => theme.font.color.tertiary};

  height: 32px;
  max-height: 32px;

  width: ${({ width }) => width}px;
`;

export const RecordTableHeaderLastColumn = () => {
  const { lastColumnWidth } = useRecordTableLastColumnWidthToFill();

  const resizeFieldOffset = useRecoilComponentValue(
    resizeFieldOffsetComponentState,
  );

  const width = lastColumnWidth - resizeFieldOffset;

  return <StyledLastColumnHeader className="header-cell" width={width} />;
};
