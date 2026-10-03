import { type FocusEvent, useId } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useRemoveFocusItemFromFocusStackOnUnmount } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackOnUnmount';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

// Blocks page shortcuts while typing; buttons are excluded since one removed on click may never blur.
export const useAiChatAskCardFieldFocus = () => {
  const focusId = useId();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  // a card answered while a field is focused unmounts without a blur
  useRemoveFocusItemFromFocusStackOnUnmount({ focusId, isEnabled: true });

  const handleFieldFocus = (event: FocusEvent) => {
    if (
      !(event.target instanceof HTMLInputElement) &&
      !(event.target instanceof HTMLTextAreaElement) &&
      !(event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return;
    }

    pushFocusItemToFocusStack({
      focusId,
      component: { type: FocusComponentType.TEXT_AREA, instanceId: focusId },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const handleFieldBlur = () => {
    removeFocusItemFromFocusStackById({ focusId });
  };

  return { handleFieldFocus, handleFieldBlur };
};
