import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const useReapplyRowSelection = () => {
  const { selectAllRows } = useSelectAllRows();

  const hasUserSelectedAllRows = useRecoilComponentValue(
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
