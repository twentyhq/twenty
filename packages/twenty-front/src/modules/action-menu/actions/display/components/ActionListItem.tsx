import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { i18n } from '@lingui/core';

export const ActionListItem = ({ action }: { action: ActionDisplayProps }) => {
  return (
    <CommandMenuItem
      id={action.key}
      Icon={action.Icon}
      label={action?.label ? i18n._(action.label) : ''}
      onClick={action.onClick}
      hotKeys={action.hotKeys}
    />
  );
};
