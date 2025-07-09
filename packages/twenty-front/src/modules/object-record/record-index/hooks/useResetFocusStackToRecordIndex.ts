import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { PageFocusId } from '@/types/PageFocusId';
import { useResetFocusStackToFocusItem } from '@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

export const useResetFocusStackToRecordIndex = () => {
  const { resetFocusStackToFocusItem } = useResetFocusStackToFocusItem();

  const resetFocusStackToRecordIndex = () => {
    resetFocusStackToFocusItem({
      focusStackItem: {
        focusId: PageFocusId.RecordIndex,
        componentInstance: {
          componentType: FocusComponentType.PAGE,
          componentInstanceId: PageFocusId.RecordIndex,
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
