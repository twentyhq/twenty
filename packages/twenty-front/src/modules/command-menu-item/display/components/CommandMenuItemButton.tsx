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
  return (
    <CommandMenuButton
      id={action.key}
      label={action.label}
      shortLabel={action.shortLabel}
      Icon={action.Icon}
      isPrimaryCTA={action.isPrimaryCTA}
      to={to}
      onClick={onClick}
    />
  );
};
