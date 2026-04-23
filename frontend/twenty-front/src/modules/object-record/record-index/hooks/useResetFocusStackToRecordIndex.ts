import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { PageFocusId } from '@/types/PageFocusId';
import { useResetFocusStackToFocusItem } from '@/ui/utilities/focus/hooks/useResetFocusStackToFocusItem';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useStore } from 'jotai';

export const useResetFocusStackToRecordIndex = () => {
  const { resetFocusStackToFocusItem } = useResetFocusStackToFocusItem();

  const store = useStore();

  const resetFocusStackToRecordIndex = () => {
    const isSidePanelOpen = store.get(isSidePanelOpenedState.atom);

    const shouldEnableGlobalHotkeys = !isSidePanelOpen;

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
