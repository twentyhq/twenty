import { NavigationButton } from '@/ui/input/components/NavigationButton';

import { type MouseEvent, useId } from 'react';
import { Link } from 'react-router-dom';
import { type Nullable } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/primitives/surfaces';
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
  const tooltipId = useId();
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
    <div data-tooltip-id={tooltipId}>
      {resolvedShortLabel !== undefined ? (
        <NavigationButton
          id={tooltipId}
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
          id={tooltipId}
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
      {(hasHotKeys || !isDefined(resolvedShortLabel)) && (
        <AppTooltip
          anchorSelect={
            disabled
              ? `[data-tooltip-id='${tooltipId}']`
              : `[id='${tooltipId}']`
          }
          title={tooltipTitle}
          delay={TooltipDelay.longDelay}
          place={TooltipPosition.Bottom}
          offset={5}
          noArrow
        />
      )}
    </div>
  );
};
