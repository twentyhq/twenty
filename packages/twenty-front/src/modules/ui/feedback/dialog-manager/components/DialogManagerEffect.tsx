import { useEffect } from 'react';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { DIALOG_MANAGER_HOTKEY_SCOPE_MEMOIZE_KEY } from '@/ui/feedback/dialog-manager/constants/DialogManagerHotkeyScopeMemoizeKey';
import { useDialogManagerScopedStates } from '../hooks/internal/useDialogManagerScopedStates';
import { DialogHotkeyScope } from '../types/DialogHotkeyScope';

export const DialogManagerEffect = () => {
  const { dialogInternal } = useDialogManagerScopedStates();

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  useEffect(() => {
    if (dialogInternal.queue.length === 0) {
      return;
    }

    setHotkeyScopeAndMemorizePreviousScope({
      scope: DialogHotkeyScope.Dialog,
      memoizeKey: DIALOG_MANAGER_HOTKEY_SCOPE_MEMOIZE_KEY,
    });
  }, [dialogInternal.queue, setHotkeyScopeAndMemorizePreviousScope]);

  return <></>;
};
