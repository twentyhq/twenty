import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
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

  if (!isMobile) {
    return undefined;
  }

  return computeRecordTableLabelIdentifierColumnWidthOnMobile(recordTableWidth);
};
