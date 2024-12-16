import { Button } from 'twenty-ui';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Key } from 'ts-key-enum';
import { RightDrawerHotkeyScope } from '@/ui/layout/right-drawer/types/RightDrawerHotkeyScope';

export const CmdEnterActionButton = ({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) => {
  useScopedHotkeys(
    [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    () => onClick(),
    RightDrawerHotkeyScope.RightDrawer,
    [onClick],
  );

  return (
    <Button
      title={title}
      variant="primary"
      accent="blue"
      size="medium"
      onClick={onClick}
      shortcut={'⌘⏎'}
    />
  );
};
