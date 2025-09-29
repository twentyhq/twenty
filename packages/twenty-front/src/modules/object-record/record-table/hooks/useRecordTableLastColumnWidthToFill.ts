import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { computeLastRecordTableColumnWidth } from '@/object-record/record-table/utils/computeLastRecordTableColumnWidth';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const useRecordTableLastColumnWidthToFill = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordTableWidth = useRecoilComponentValue(
    recordTableWidthComponentState,
  );

  const isMobile = useIsMobile();

  const { lastColumnWidth } = computeLastRecordTableColumnWidth({
    recordFields: visibleRecordFields,
    tableWidth: recordTableWidth,
    isMobile,
  });

  return {
    lastColumnWidth,
  };
};
