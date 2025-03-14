import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { Key } from 'ts-key-enum';
import { Button, getOsControlSymbol } from 'twenty-ui';

export const CmdEnterActionButton = ({
  title,
  onClick,
  disabled = false,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  useScopedHotkeys(
    [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    () => onClick(),
    AppHotkeyScope.CommandMenuOpen,
    [onClick],
  );

  return (
    <Button
      title={title}
      variant="primary"
      accent="blue"
      size="medium"
      onClick={onClick}
      disabled={disabled}
      hotkeys={[getOsControlSymbol(), '⏎']}
    />
  );
};
