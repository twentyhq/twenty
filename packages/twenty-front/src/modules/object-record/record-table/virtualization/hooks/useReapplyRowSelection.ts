import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useReapplyRowSelection = () => {
  const { selectAllRows } = useSelectAllRows();

  const hasUserSelectedAllRows = useAtomComponentValue(
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
