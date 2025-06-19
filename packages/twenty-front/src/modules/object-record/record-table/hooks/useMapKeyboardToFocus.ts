import { RECORD_INDEX_FOCUS_ID } from '@/object-record/record-index/constants/RecordIndexFocusId';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useRecordTableMove } from '@/object-record/record-table/hooks/useRecordTableMove';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { Key } from 'ts-key-enum';

const TABLE_NAVIGATION_CUSTOM_SCOPES = {
  goto: true,
  keyboardShortcutMenu: true,
  searchRecords: true,
};

export const useMapKeyboardToFocus = (recordTableId: string) => {
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const { move } = useRecordTableMove(recordTableId);

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowUp],
    callback: () => {
      setHotkeyScopeAndMemorizePreviousScope({
        scope: TableHotkeyScope.TableFocus,
        customScopes: TABLE_NAVIGATION_CUSTOM_SCOPES,
      });
      move('up');
    },
    focusId: RECORD_INDEX_FOCUS_ID,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [move],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowDown],
    callback: () => {
      setHotkeyScopeAndMemorizePreviousScope({
        scope: TableHotkeyScope.TableFocus,
        customScopes: TABLE_NAVIGATION_CUSTOM_SCOPES,
      });
      move('down');
    },
    focusId: RECORD_INDEX_FOCUS_ID,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [move],
  });
};
