import { Keys } from 'react-hotkeys-hook';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

type HotkeyEffectProps = {
  hotkey: {
    key: Keys;
    scope: string;
  };
  onHotkeyTriggered: () => void;
};

export const HotkeyEffect = ({
  hotkey,
  onHotkeyTriggered,
}: HotkeyEffectProps) => {
  useScopedHotkeys(hotkey.key, () => onHotkeyTriggered(), hotkey.scope, [
    onHotkeyTriggered,
  ]);

  return <></>;
};
