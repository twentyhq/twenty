import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useRecordTableMove } from '@/object-record/record-table/hooks/useRecordTableMove';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Key } from 'ts-key-enum';

export const useMapKeyboardToFocus = (recordTableId?: string) => {
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const { move } = useRecordTableMove(recordTableId);

  useScopedHotkeys(
    [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`],
    () => {
      move('up');
    },
    TableHotkeyScope.TableFocus,
    [move],
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      move('down');
    },
    TableHotkeyScope.TableFocus,
    [move],
  );

  useScopedHotkeys(
    [Key.ArrowUp],
    () => {
      setHotkeyScopeAndMemorizePreviousScope(TableHotkeyScope.TableFocus);
      move('up');
    },
    RecordIndexHotkeyScope.RecordIndex,
    [move],
  );

  useScopedHotkeys(
    [Key.ArrowDown],
    () => {
      setHotkeyScopeAndMemorizePreviousScope(TableHotkeyScope.TableFocus);
      move('down');
    },
    RecordIndexHotkeyScope.RecordIndex,
    [move],
  );

  useScopedHotkeys(
    [Key.ArrowLeft, `${Key.Shift}+${Key.Tab}`],
    () => {
      move('left');
    },
    TableHotkeyScope.TableFocus,
    [move],
  );

  useScopedHotkeys(
    [Key.ArrowRight, Key.Tab],
    () => {
      move('right');
    },
    TableHotkeyScope.TableFocus,
    [move],
  );
};
