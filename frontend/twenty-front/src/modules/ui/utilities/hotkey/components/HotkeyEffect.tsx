import { type Keys } from 'react-hotkeys-hook';

import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';

type HotkeyEffectProps = {
  hotkey: {
    key: Keys;
  };
  onHotkeyTriggered: () => void;
  focusId: string;
};

export const HotkeyEffect = ({
  hotkey,
  focusId,
  onHotkeyTriggered,
}: HotkeyEffectProps) => {
  useHotkeysOnFocusedElement({
    keys: hotkey.key,
    callback: onHotkeyTriggered,
    focusId,
    dependencies: [onHotkeyTriggered],
  });

  return <></>;
};
