import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { type CommandMenuItemDisplayProps } from '@/command-menu-item/display/components/CommandMenuItemDisplay';

export const CommandMenuItemButton = ({
  action,
  onClick,
  to,
}: {
  action: CommandMenuItemDisplayProps;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  to?: string;
}) => {
  return <CommandMenuButton command={action} to={to} onClick={onClick} />;
};
