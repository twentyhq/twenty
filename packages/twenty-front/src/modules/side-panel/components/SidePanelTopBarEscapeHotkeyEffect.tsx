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
  const handleEscape = (event: KeyboardEvent) => {
    if (document.activeElement === inputRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    onEscape();
  };

  useGlobalHotkeys({
    keys: [Key.Escape],
    callback: handleEscape,
    containsModifier: false,
    dependencies: [handleEscape],
    options: {
      eventListenerOptions: {
        capture: true,
      },
      preventDefault: false,
    },
  });

  return null;
};
