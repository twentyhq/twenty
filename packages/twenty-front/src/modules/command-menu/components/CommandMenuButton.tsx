import { styled } from '@linaria/react';
import { type MouseEvent, useId } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/primitives/surfaces';
import { Button, IconButton } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWrapper = styled.div`
  font-size: ${themeCssVariables.font.size.md};
`;

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
      {(hasHotKeys || !isDefined(resolvedShortLabel)) && (
        <StyledWrapper>
          <AppTooltip
            anchorSelect={
              disabled
                ? `[data-tooltip-id='${tooltipId}']`
                : `[data-tooltip-id='${tooltipId}'] > :first-child`
            }
            title={tooltipTitle}
            delay={TooltipDelay.longDelay}
            place={TooltipPosition.Bottom}
            offset={5}
            noArrow
          />
        </StyledWrapper>
      )}
    </div>
  );
};
