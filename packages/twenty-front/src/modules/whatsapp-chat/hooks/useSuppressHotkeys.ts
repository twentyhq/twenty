import { type FocusEventHandler, useCallback, useEffect, useRef } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

/**
 * Returns onFocus/onBlur handlers that disable Twenty's global keyboard
 * shortcuts while a text input or textarea is focused.
 */
export const useSuppressHotkeys = (focusId: string) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const idRef = useRef(focusId);
  idRef.current = focusId;

  const handleFocus: FocusEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(() => {
    pushFocusItemToFocusStack({
      focusId: idRef.current,
      component: {
        type: FocusComponentType.TEXT_AREA,
        instanceId: idRef.current,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  }, [pushFocusItemToFocusStack]);

  const handleBlur: FocusEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback(() => {
    removeFocusItemFromFocusStackById({ focusId: idRef.current });
  }, [removeFocusItemFromFocusStackById]);

  useEffect(() => {
    return () => {
      removeFocusItemFromFocusStackById({ focusId: idRef.current });
    };
  }, [removeFocusItemFromFocusStackById]);

  return { handleFocus, handleBlur };
};
