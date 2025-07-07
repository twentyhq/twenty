import { useEffect } from 'react';

import { DIALOG_FOCUS_ID } from '@/ui/feedback/dialog-manager/constants/DialogFocusId';
import { DIALOG_MANAGER_HOTKEY_SCOPE_MEMOIZE_KEY } from '@/ui/feedback/dialog-manager/constants/DialogManagerHotkeyScopeMemoizeKey';
import { DialogHotkeyScope } from '@/ui/feedback/dialog-manager/types/DialogHotkeyScope';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useDialogManagerScopedStates } from '../hooks/internal/useDialogManagerScopedStates';

export const DialogManagerEffect = () => {
  const { dialogInternal } = useDialogManagerScopedStates();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  useEffect(() => {
    if (dialogInternal.queue.length === 0) {
      return;
    }

    pushFocusItemToFocusStack({
      focusId: DIALOG_FOCUS_ID,
      component: {
        type: FocusComponentType.DIALOG,
        instanceId: DIALOG_FOCUS_ID,
      },
      hotkeyScope: {
        scope: DialogHotkeyScope.Dialog,
      },
      memoizeKey: DIALOG_MANAGER_HOTKEY_SCOPE_MEMOIZE_KEY,
    });
  }, [dialogInternal.queue, pushFocusItemToFocusStack]);

  return <></>;
};
