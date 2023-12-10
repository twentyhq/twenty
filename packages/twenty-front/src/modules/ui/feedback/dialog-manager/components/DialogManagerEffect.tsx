import { useEffect } from 'react';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

import { useDialogManagerScopedStates } from '../hooks/internal/useDialogManagerScopedStates';
import { DialogHotkeyScope } from '../types/DialogHotkeyScope';

export const DialogManagerEffect = () => {
  const { dialogInternal } = useDialogManagerScopedStates();

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  useEffect(() => {
    if (dialogInternal.queue.length === 0) {
      return;
    }

    setHotkeyScopeAndMemorizePreviousScope(DialogHotkeyScope.Dialog);
  }, [dialogInternal.queue, setHotkeyScopeAndMemorizePreviousScope]);

  return <></>;
};
