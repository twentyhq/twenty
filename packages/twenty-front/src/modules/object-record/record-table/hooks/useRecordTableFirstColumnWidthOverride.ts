import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { computeRecordTableLabelIdentifierColumnWidthOnMobile } from '@/object-record/record-table/utils/computeRecordTableLabelIdentifierColumnWidthOnMobile';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

export const useRecordTableFirstColumnWidthOverride = (
  instanceId?: string,
): number | undefined => {
  const isMobile = useIsMobile();

  const recordTableWidth = useAtomComponentStateValue(
    recordTableWidthComponentState,
    instanceId,
  );

  const shouldCompactRecordTableFirstColumn = useAtomComponentStateValue(
    shouldCompactRecordTableFirstColumnComponentState,
    instanceId,
  );

  if (!isMobile) {
    return undefined;
  }

  return computeRecordTableLabelIdentifierColumnWidthOnMobile({
    tableWidth: recordTableWidth,
    isCollapsed: shouldCompactRecordTableFirstColumn,
  });
};
