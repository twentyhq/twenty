import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { Key } from 'ts-key-enum';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';

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
      variant={disabled ? 'secondary' : 'primary'}
      accent="blue"
      size="medium"
      onClick={onClick}
      disabled={disabled}
      hotkeys={[getOsControlSymbol(), '⏎']}
    />
  );
};
