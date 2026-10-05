import { Key } from 'ts-key-enum';

import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

type DialogEnterHotkeyEffectProps = {
  dialogId: string;
  onEnter: () => void;
};

export const DialogEnterHotkeyEffect = ({
  dialogId,
  onEnter,
}: DialogEnterHotkeyEffectProps) => {
  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: onEnter,
    focusId: dialogId,
    dependencies: [onEnter],
  });
  return null;
};
