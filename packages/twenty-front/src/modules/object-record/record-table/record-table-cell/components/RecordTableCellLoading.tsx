import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { type Theme, useTheme } from '@emotion/react';
import { styled } from '@linaria/react';

const StyledStaticCellSkeleton = styled.div<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 8px;
  margin: 8px;
`;

export const RecordTableCellLoading = ({
  recordFieldIndex,
  isSelected = false,
}: {
  recordFieldIndex: number;
  isSelected?: boolean;
}) => {
  const theme = useTheme();

  return (
    <RecordTableCellStyleWrapper
      widthClassName={getRecordTableColumnFieldWidthClassName(recordFieldIndex)}
      isSelected={isSelected}
    >
      <StyledStaticCellSkeleton theme={theme} />
    </RecordTableCellStyleWrapper>
  );
};
