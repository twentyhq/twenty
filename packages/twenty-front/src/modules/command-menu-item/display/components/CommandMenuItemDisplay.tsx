import { CommandMenuItemButton } from '@/command-menu-item/display/components/CommandMenuItemButton';
import { CommandDropdownItem } from '@/command-menu-item/display/components/CommandDropdownItem';
import { CommandListItem } from '@/command-menu-item/display/components/CommandListItem';
import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useIsCommandBlockedByGlobalLayoutCustomization } from '@/command-menu-item/hooks/useIsCommandBlockedByGlobalLayoutCustomization';
import { type MessageDescriptor } from '@lingui/core';
import { useContext } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';

export type CommandMenuItemDisplayProps = {
  key: string;
  label: Nullable<MessageDescriptor | string>;
  shortLabel?: Nullable<MessageDescriptor | string>;
  description?: MessageDescriptor | string;
  Icon: IconComponent;
  isPrimaryCTA?: boolean;
  hotKeys?: Nullable<string[]>;
};

export const CommandMenuItemDisplay = ({
  onClick,
  to,
  disabled,
  progress,
  showDisabledLoader = false,
}: {
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  to?: string;
  disabled?: boolean;
  progress?: number;
  showDisabledLoader?: boolean;
}) => {
  const commandMenuItem = useContext(CommandConfigContext);
  const { displayType } = useContext(CommandMenuContext);
  const isBlockedByGlobalLayoutCustomization =
    useIsCommandBlockedByGlobalLayoutCustomization(commandMenuItem);

  if (!commandMenuItem) {
    return null;
  }

  const isDisabled =
    disabled === true || isBlockedByGlobalLayoutCustomization === true;

  const onClickWhenEnabled = isDisabled ? undefined : onClick;
  const toWhenEnabled = isDisabled ? undefined : to;

  if (displayType === 'button') {
    return (
      <CommandMenuItemButton
        commandMenuItem={commandMenuItem}
        onClick={onClickWhenEnabled}
        to={toWhenEnabled}
        disabled={isDisabled}
      />
    );
  }

  if (displayType === 'listItem') {
    return (
      <CommandListItem
        commandMenuItem={commandMenuItem}
        onClick={onClickWhenEnabled}
        to={toWhenEnabled}
        disabled={isDisabled}
        progress={progress}
        showDisabledLoader={showDisabledLoader}
      />
    );
  }

  if (displayType === 'dropdownItem') {
    return (
      <CommandDropdownItem
        commandMenuItem={commandMenuItem}
        onClick={onClickWhenEnabled}
        to={toWhenEnabled}
        disabled={isDisabled}
      />
    );
  }

  return assertUnreachable(displayType, 'Unsupported display type');
};
