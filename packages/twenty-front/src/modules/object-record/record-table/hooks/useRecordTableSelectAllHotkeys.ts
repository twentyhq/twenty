import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

export const useRecordTableSelectAllHotkeys = ({
  recordTableId,
  focusId,
}: {
  recordTableId?: string;
  focusId: string;
}) => {
  const { selectAllRows } = useSelectAllRows(recordTableId);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+a', 'meta+a'],
    callback: selectAllRows,
    focusId,
    dependencies: [selectAllRows],
    options: {
      enableOnFormTags: false,
    },
  });
};
