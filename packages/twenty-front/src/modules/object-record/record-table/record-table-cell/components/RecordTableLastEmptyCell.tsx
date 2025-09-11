import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableLastColumnWidthToFill } from '@/object-record/record-table/hooks/useRecordTableLastColumnWidthToFill';
import { RecordTableTd } from '@/object-record/record-table/record-table-cell/components/RecordTableTd';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTableLastEmptyCell = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();
  const { lastColumnWidth } = useRecordTableLastColumnWidthToFill();

  const resizeFieldOffset = useRecoilComponentValue(
    resizeFieldOffsetComponentState,
  );

  const width =
    resizeFieldOffset > 0
      ? lastColumnWidth + resizeFieldOffset
      : lastColumnWidth;

  return (
    <RecordTableTd
      isSelected={isSelected}
      hasRightBorder={false}
      width={width}
    />
  );
};
