import { type RefObject } from 'react';
import { Key } from 'ts-key-enum';

import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';

type SidePanelTopBarEscapeHotkeyEffectProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  onEscape: () => void;
};

export const SidePanelTopBarEscapeHotkeyEffect = ({
  inputRef,
  onEscape,
}: SidePanelTopBarEscapeHotkeyEffectProps) => {
  const handleEscape = () => {
    if (document.activeElement === inputRef.current) {
      return;
    }

    onEscape();
  };

  useGlobalHotkeys({
    keys: [Key.Escape],
    callback: handleEscape,
    containsModifier: false,
    dependencies: [handleEscape],
  });

  return null;
};
