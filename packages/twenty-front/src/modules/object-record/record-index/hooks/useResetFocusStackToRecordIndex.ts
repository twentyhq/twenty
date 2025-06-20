import { RECORD_INDEX_FOCUS_ID } from '@/object-record/record-index/constants/RecordIndexFocusId';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useResetFocusStackToFocusItem } from '@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

export const useResetFocusStackToRecordIndex = () => {
  const { resetFocusStackToFocusItem } = useResetFocusStackToFocusItem();

  const resetFocusStackToRecordIndex = () => {
    resetFocusStackToFocusItem({
      focusStackItem: {
        focusId: RECORD_INDEX_FOCUS_ID,
        componentInstance: {
          componentType: FocusComponentType.PAGE,
          componentInstanceId: RECORD_INDEX_FOCUS_ID,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: true,
        },
        memoizeKey: 'global',
      },
      hotkeyScope: {
        scope: RecordIndexHotkeyScope.RecordIndex,
        customScopes: {
          goto: true,
          keyboardShortcutMenu: true,
          searchRecords: true,
        },
      },
    });
  };

  return {
    resetFocusStackToRecordIndex,
  };
};
