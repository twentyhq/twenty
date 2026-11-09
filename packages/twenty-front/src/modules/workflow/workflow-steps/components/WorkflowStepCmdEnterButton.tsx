import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';

export const WorkflowStepCmdEnterButton = ({
  title,
  onClick,
  disabled = false,
  form,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  form?: string;
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
      type={isDefined(form) ? 'submit' : 'button'}
      form={form}
      shortcut={['Mod', 'Enter']}
      variant={disabled ? 'outline' : 'solid'}
      color="accent"
    >
      {title}
    </Button>
  );
};
