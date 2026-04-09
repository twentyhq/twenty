import { type CommandMenuItemDisplayProps } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { CommandListItemLoader } from './CommandListItemLoader';

export const CommandListItem = ({
  commandMenuItem,
  onClick,
  to,
  disabled = false,
  progress,
  showDisabledLoader = false,
}: {
  commandMenuItem: CommandMenuItemDisplayProps;
  onClick?: () => void;
  to?: string;
  disabled?: boolean;
  progress?: number;
  showDisabledLoader?: boolean;
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (disabled) {
      return;
    }

    onClick?.();
    if (isDefined(to)) {
      navigate(to);
    }
  };

  const loaderComponent =
    disabled && showDisabledLoader ? (
      isDefined(progress) ? (
        <CommandListItemLoader progress={progress} />
      ) : (
        <Loader />
      )
    ) : undefined;

  return (
    <SelectableListItem itemId={commandMenuItem.key} onEnter={handleClick}>
      <CommandMenuItem
        id={commandMenuItem.key}
        Icon={commandMenuItem.Icon}
        label={getCommandMenuItemLabel(commandMenuItem.label)}
        description={getCommandMenuItemLabel(commandMenuItem.description)}
        to={to}
        onClick={disabled ? undefined : onClick}
        hotKeys={commandMenuItem.hotKeys}
        disabled={disabled}
        RightComponent={loaderComponent}
      />
    </SelectableListItem>
  );
};
