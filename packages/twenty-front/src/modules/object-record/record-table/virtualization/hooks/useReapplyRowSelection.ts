import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useReapplyRowSelection = () => {
  const { selectAllRows } = useSelectAllRows();

  const hasUserSelectedAllRows = useAtomComponentStateValue(
    hasUserSelectedAllRowsComponentState,
  );

  const reapplyRowSelection = () => {
    if (hasUserSelectedAllRows) {
      selectAllRows();
    }
  };

  return {
    reapplyRowSelection,
  };
};
