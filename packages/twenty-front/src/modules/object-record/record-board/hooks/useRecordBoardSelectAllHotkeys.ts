import { useSelectAllRecords } from '@/object-record/record-selection/hooks/useSelectAllRecords';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

export const useRecordBoardSelectAllHotkeys = ({
  recordBoardId,
  focusId,
}: {
  recordBoardId: string;
  focusId: string;
}) => {
  const { selectAllRecords } = useSelectAllRecords(recordBoardId);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+a', 'meta+a'],
    callback: selectAllRecords,
    focusId,
    dependencies: [selectAllRecords],
    options: {
      enableOnFormTags: false,
    },
  });
};
