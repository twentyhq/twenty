import { styled } from '@linaria/react';
import { i18n, type MessageDescriptor } from '@lingui/core';
import { isString } from '@sniptt/guards';
import { type MouseEvent } from 'react';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/display';
import { type IconComponent } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWrapper = styled.div`
  font-size: ${themeCssVariables.font.size.md};
`;

export type CommandMenuButtonProps = {
  id: string;
  label: string | MessageDescriptor;
  shortLabel?: string | MessageDescriptor;
  Icon: IconComponent;
  isPrimaryCTA?: boolean;
  onClick?: (event?: MouseEvent<HTMLElement>) => void;
  to?: string;
};

const getCommandMenuButtonLabel = (
  label: string | MessageDescriptor,
): string => {
  return isString(label) ? label : i18n._(label);
};

export const CommandMenuButton = ({
  id,
  label,
  shortLabel,
  Icon,
  isPrimaryCTA = false,
  onClick,
  to,
}: CommandMenuButtonProps) => {
  const resolvedLabel = getCommandMenuButtonLabel(label);

  const resolvedShortLabel =
    shortLabel === undefined
      ? undefined
      : getCommandMenuButtonLabel(shortLabel);

  const buttonAccent = isPrimaryCTA ? 'blue' : 'default';

  return (
    <>
      {resolvedShortLabel !== undefined ? (
        <Button
          Icon={Icon}
          size="small"
          variant="secondary"
          accent={buttonAccent}
          to={to}
          onClick={onClick}
          title={resolvedShortLabel}
          ariaLabel={resolvedLabel}
        />
      ) : (
        <div id={`command-menu-button-entry-${id}`} key={id}>
          <IconButton
            Icon={Icon}
            size="small"
            variant="secondary"
            accent={buttonAccent}
            to={to}
            onClick={onClick}
            ariaLabel={resolvedLabel}
          />
          <StyledWrapper>
            <AppTooltip
              anchorSelect={`#command-menu-button-entry-${id}`}
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
