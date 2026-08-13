import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

// Mobile drops the selection column: bulk selection is not worth a column of
// horizontal space on a phone.
export const useIsRecordTableCheckboxColumnHidden = (instanceId?: string) => {
  const isMobile = useIsMobile();
  const isRecordTableCheckboxColumnHidden = useAtomComponentStateValue(
    isRecordTableCheckboxColumnHiddenComponentState,
    instanceId,
  );

  return isRecordTableCheckboxColumnHidden || isMobile;
};
