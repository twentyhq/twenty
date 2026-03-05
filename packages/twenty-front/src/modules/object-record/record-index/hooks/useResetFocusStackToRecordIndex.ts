import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { PageFocusId } from '@/types/PageFocusId';
import { useResetFocusStackToFocusItem } from '@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';

export const useResetFocusStackToRecordIndex = () => {
  const { resetFocusStackToFocusItem } = useResetFocusStackToFocusItem();

  const store = useStore();

  const resetFocusStackToRecordIndex = () => {
    const isCommandMenuOpen = store.get(isCommandMenuOpenedState.atom);

    const shouldEnableGlobalHotkeys = !isCommandMenuOpen;

    resetFocusStackToFocusItem({
      focusStackItem: {
        focusId: PageFocusId.RecordIndex,
        componentInstance: {
          componentType: FocusComponentType.PAGE,
          componentInstanceId: PageFocusId.RecordIndex,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysWithModifiers: shouldEnableGlobalHotkeys,
          enableGlobalHotkeysConflictingWithKeyboard: shouldEnableGlobalHotkeys,
        },
      },
    });
  };

  return {
    resetFocusStackToRecordIndex,
  };
};
