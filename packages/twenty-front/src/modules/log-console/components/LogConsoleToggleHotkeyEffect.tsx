import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';

type LogConsoleToggleHotkeyEffectProps = {
  onToggle: () => void;
};

export const LogConsoleToggleHotkeyEffect = ({
  onToggle,
}: LogConsoleToggleHotkeyEffectProps) => {
  useGlobalHotkeys({
    keys: ['ctrl+j', 'meta+j'],
    callback: onToggle,
    containsModifier: true,
    dependencies: [onToggle],
  });

  return null;
};
