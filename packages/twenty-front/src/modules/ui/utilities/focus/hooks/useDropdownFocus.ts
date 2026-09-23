import { useId } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

export const useDropdownFocus = () => {
  const focusId = useId();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const updateDropdownFocus = (open: boolean) => {
    if (!open) {
      removeFocusItemFromFocusStackById({ focusId });
      return;
    }

    pushFocusItemToFocusStack({
      focusId,
      component: { type: FocusComponentType.DROPDOWN, instanceId: focusId },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
        enableGlobalHotkeysWithModifiers: false,
      },
    });
  };

  return { focusId, updateDropdownFocus };
};
