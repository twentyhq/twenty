import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';

type CommandMenuItemButtonHotkeyEffectProps = {
  hotKey: string;
  disabled: boolean;
  onHotkeyTriggered: () => void;
};

export const CommandMenuItemButtonHotkeyEffect = ({
  hotKey,
  disabled,
  onHotkeyTriggered,
}: CommandMenuItemButtonHotkeyEffectProps) => {
  useGlobalHotkeys({
    keys: [hotKey.toLowerCase()],
    callback: () => {
      if (!disabled) {
        onHotkeyTriggered();
      }
    },
    containsModifier: false,
    dependencies: [disabled, onHotkeyTriggered],
    // A bare letter belongs to whatever field is being typed in
    options: { enableOnFormTags: false, enableOnContentEditable: false },
  });

  return null;
};
