import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { useCommandMenuItemClick } from '@/command-menu-item/hooks/useCommandMenuItemClick';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useContext } from 'react';
import { useIcons } from 'twenty-ui/icon';

export const useCommandMenuItemDisplay = (item: CommandMenuItemDefinition) => {
  const { commandMenuContextApi } = useContext(CommandMenuContext);
  const { getIcon } = useIcons();

  const { iconKey, label, shortLabel } = interpolateCommandMenuItemFields(
    item,
    commandMenuContextApi,
  );

  const Icon = getIcon(iconKey, COMMAND_MENU_DEFAULT_ICON);

  const { handleClick, disabled, progress, showDisabledLoader } =
    useCommandMenuItemClick({ item, Icon, label });

  return {
    Icon,
    label,
    shortLabel,
    handleClick,
    disabled,
    progress,
    isLoading: showDisabledLoader,
  };
};
