import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useEffect } from 'react';

export const useAdvancedTextEditorFocus = (instanceId: string) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(() => {
    return () => {
      removeFocusItemFromFocusStackById({ focusId: instanceId });
    };
  }, [instanceId, removeFocusItemFromFocusStackById]);

  const onFocus = () => {
    pushFocusItemToFocusStack({
      focusId: instanceId,
      component: {
        type: FocusComponentType.FORM_FIELD_INPUT,
        instanceId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
  };

  const onBlur = () => {
    removeFocusItemFromFocusStackById({ focusId: instanceId });
  };

  return { onFocus, onBlur };
};
