import { Keys } from 'react-hotkeys-hook';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

type OwnProps = {
  hotkey: {
    key: Keys;
    scope: string;
  };
  onHotkeyTriggered: () => void;
};

export function HotkeyEffect({ hotkey, onHotkeyTriggered }: OwnProps) {
  useScopedHotkeys(hotkey.key, () => onHotkeyTriggered(), hotkey.scope, [
    onHotkeyTriggered,
  ]);

  return <></>;
}
