import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const useReapplyRowSelection = () => {
  const { selectAllRows } = useSelectAllRows();

  const hasUserSelectedAllRows = useRecoilComponentValueV2(
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
