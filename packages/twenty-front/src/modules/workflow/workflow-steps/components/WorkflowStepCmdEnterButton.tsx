import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';
import { Button } from 'twenty-ui/primitives/input';

export const WorkflowStepCmdEnterButton = ({
  title,
  onClick,
  disabled = false,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: () => onClick(),
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [onClick],
  });

  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={disabled}
      shortcut={{ type: 'combination', keys: ['Mod', 'Enter'] }}
      variant={disabled ? 'outline' : 'solid'}
      color="accent"
    >
      {title}
    </Button>
  );
};
