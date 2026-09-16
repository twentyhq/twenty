import { type MouseEvent } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { Button, IconButton } from 'twenty-ui/primitives/input';

export type CommandMenuButtonProps = {
  command: {
    key: string;
    label: string;
    shortLabel?: Nullable<string>;
    hotKeys?: Nullable<string[]>;
    Icon: IconComponent;
    isPrimaryCTA?: boolean;
  };
  onClick?: (event?: MouseEvent<HTMLElement>) => void;
  to?: string;
  disabled?: boolean;
  isPrimaryAction?: boolean;
  shouldHideLabel?: boolean;
};

export const CommandMenuButton = ({
  command,
  onClick,
  to,
  disabled = false,
  isPrimaryAction = false,
  shouldHideLabel = false,
}: CommandMenuButtonProps) => {
  const { hotKeys } = command;
  const hasHotKeys = isNonEmptyArray(hotKeys);
  const tooltipTitle = hasHotKeys
    ? `${command.label} (${hotKeys.join(' → ')})`
    : command.label;

  const resolvedShortLabel =
    isDefined(command.shortLabel) && !shouldHideLabel
      ? command.shortLabel
      : undefined;

  const buttonAccent =
    isPrimaryAction || command.isPrimaryCTA === true ? 'blue' : 'default';

  return (
    <Tooltip
      content={tooltipTitle}
      delay={1000}
      side="bottom"
      sideOffset={5}
      disabled={!hasHotKeys && isDefined(resolvedShortLabel)}
    >
      <div>
        {resolvedShortLabel !== undefined ? (
          <Button
            Icon={command.Icon}
            size="small"
            variant="primary"
            accent={buttonAccent}
            to={to}
            onClick={onClick}
            disabled={disabled}
            title={resolvedShortLabel}
            ariaLabel={command.label}
          />
        ) : (
          <IconButton
            Icon={command.Icon}
            size="small"
            variant="primary"
            accent={buttonAccent}
            to={to}
            onClick={onClick}
            disabled={disabled}
            ariaLabel={command.label}
          />
        )}
      </div>
    </Tooltip>
  );
};
