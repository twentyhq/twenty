import { styled } from '@linaria/react';
import { i18n, type MessageDescriptor } from '@lingui/core';
import { isString } from '@sniptt/guards';
import { type MouseEvent } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  type IconComponent,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWrapper = styled.div`
  font-size: ${themeCssVariables.font.size.md};
`;

export type CommandMenuButtonProps = {
  command: {
    key: string;
    label: string | MessageDescriptor;
    shortLabel?: Nullable<string | MessageDescriptor>;
    Icon: IconComponent;
    isPrimaryCTA?: boolean;
  };
  onClick?: (event?: MouseEvent<HTMLElement>) => void;
  to?: string;
  disabled?: boolean;
};

const getCommandMenuButtonLabel = (
  label: string | MessageDescriptor,
): string => {
  return isString(label) ? label : i18n._(label);
};

export const CommandMenuButton = ({
  command,
  onClick,
  to,
  disabled = false,
}: CommandMenuButtonProps) => {
  const resolvedLabel = getCommandMenuButtonLabel(command.label);

  const resolvedShortLabel = isDefined(command.shortLabel)
    ? getCommandMenuButtonLabel(command.shortLabel)
    : undefined;

  const buttonAccent = command.isPrimaryCTA ? 'blue' : 'default';

  return (
    <>
      {resolvedShortLabel !== undefined ? (
        <Button
          Icon={command.Icon}
          size="small"
          variant="secondary"
          accent={buttonAccent}
          to={to}
          onClick={onClick}
          disabled={disabled}
          title={resolvedShortLabel}
          ariaLabel={resolvedLabel}
        />
      ) : (
        <div id={`command-menu-item-entry-${command.key}`} key={command.key}>
          <IconButton
            Icon={command.Icon}
            size="small"
            variant="secondary"
            accent={buttonAccent}
            to={to}
            onClick={onClick}
            disabled={disabled}
            ariaLabel={resolvedLabel}
          />
          <StyledWrapper>
            <AppTooltip
              anchorSelect={`#command-menu-item-entry-${command.key}`}
              content={resolvedLabel}
              delay={TooltipDelay.longDelay}
              place={TooltipPosition.Bottom}
              offset={5}
              noArrow
            />
          </StyledWrapper>
        </div>
      )}
    </>
  );
};
