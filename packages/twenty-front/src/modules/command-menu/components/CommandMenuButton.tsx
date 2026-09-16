import { getCommandMenuButtonLabel } from '@/command-menu/utils/getCommandMenuButtonLabel';
import { NavigationButton } from '@/ui/input/components/NavigationButton';

import { type MouseEvent, useId } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/primitives/surfaces';
import { IconButton } from 'twenty-ui/primitives/input';

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
  progress?: number;
  loading?: boolean;
  isPrimaryAction?: boolean;
  shouldHideLabel?: boolean;
};

export const CommandMenuButton = ({
  command,
  onClick,
  to,
  disabled = false,
  progress,
  loading = false,
  isPrimaryAction = false,
  shouldHideLabel = false,
}: CommandMenuButtonProps) => {
  const tooltipId = useId();
  const { hotKeys } = command;
  const hasHotKeys = isNonEmptyArray(hotKeys);
  const tooltipTitle = hasHotKeys
    ? `${command.label} (${hotKeys.join(' → ')})`
    : command.label;

  const resolvedShortLabel = getCommandMenuButtonLabel({
    shortLabel: command.shortLabel,
    isLoading: loading,
    progress,
    shouldHideLabel,
  });

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
          loading={loading && !isDefined(progress)}
          aria-label={command.label}
          variant={buttonAccent === 'blue' ? 'solid' : 'outline'}
          color={buttonAccent === 'blue' ? 'accent' : 'neutral'}
        >
          {resolvedShortLabel}
        </NavigationButton>
      ) : (
        <IconButton
          id={tooltipId}
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
