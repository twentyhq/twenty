import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { type CommandMenuItemDisplayProps } from '@/command-menu-item/display/components/CommandMenuItemDisplay';

export const CommandMenuItemButton = ({
  action,
  onClick,
  to,
  disabled = false,
}: {
  action: CommandMenuItemDisplayProps;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  to?: string;
  disabled?: boolean;
}) => {
  return (
    <CommandMenuButton
      command={action}
      to={to}
      onClick={onClick}
      disabled={disabled}
    />
  );
};
