import { RecordTableCellStyleWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellStyleWrapper';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { useTheme } from '@emotion/react';

export const RecordTableCellLoading = ({
  recordFieldIndex,
}: {
  recordFieldIndex: number;
}) => {
  const theme = useTheme();

  return (
    <RecordTableCellStyleWrapper
      widthClassName={getRecordTableColumnFieldWidthClassName(recordFieldIndex)}
    >
      <div
        style={{
          backgroundColor: theme.background.tertiary,
          borderRadius: theme.border.radius.sm,
          padding: 8,
          margin: 8,
        }}
      />
    </RecordTableCellStyleWrapper>
  );
};
