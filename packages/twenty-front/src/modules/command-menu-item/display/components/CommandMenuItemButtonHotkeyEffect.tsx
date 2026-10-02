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
  });

  return null;
};
