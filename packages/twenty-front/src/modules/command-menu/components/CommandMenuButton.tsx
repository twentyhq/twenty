import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

import { type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { type Nullable } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { IconButton } from 'twenty-ui/components';

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
      delay={TooltipDelay.longDelay}
      side="bottom"
      sideOffset={5}
      disabled={!hasHotKeys && isDefined(resolvedShortLabel)}
    >
      <div>
        {resolvedShortLabel !== undefined ? (
          <NavigationButton
            startIcon={isDefined(command.Icon) ? <command.Icon /> : undefined}
            size="sm"
            to={to}
            onClick={onClick}
            disabled={disabled}
            aria-label={command.label}
            variant={buttonAccent === 'blue' ? 'solid' : 'outline'}
            color={buttonAccent === 'blue' ? 'accent' : 'neutral'}
          >
            {resolvedShortLabel}
          </NavigationButton>
        ) : (
          <IconButton
            size="sm"
            variant={buttonAccent === 'blue' ? 'solid' : 'outline'}
            color={buttonAccent === 'blue' ? 'accent' : 'neutral'}
            render={isDefined(to) ? <Link to={to} /> : undefined}
            href={to}
            onClick={onClick}
            disabled={disabled}
            aria-label={command.label}
          >
            <command.Icon />
          </IconButton>
        )}
      </div>
    </Tooltip>
  );
};
