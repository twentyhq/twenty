import { Keys } from 'react-hotkeys-hook';

import { DropdownHotkeyScope } from '@/ui/layout/dropdown/constants/DropdownHotkeyScope';
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
    scope: DropdownHotkeyScope.Dropdown,
    dependencies: [onHotkeyTriggered],
  });

  return <></>;
};
