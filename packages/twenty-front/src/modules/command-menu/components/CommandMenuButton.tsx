import { styled } from '@linaria/react';
import { type MouseEvent } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/surfaces';
import { Button, IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWrapper = styled.div`
  font-size: ${themeCssVariables.font.size.md};
`;

export type CommandMenuButtonProps = {
  command: {
    key: string;
    label: string;
    shortLabel?: Nullable<string>;
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
  const resolvedShortLabel =
    isDefined(command.shortLabel) && !shouldHideLabel
      ? command.shortLabel
      : undefined;

  const buttonAccent =
    isPrimaryAction || command.isPrimaryCTA === true ? 'blue' : 'default';

  return (
    <>
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
        <div id={`command-menu-item-entry-${command.key}`} key={command.key}>
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
          <StyledWrapper>
            <AppTooltip
              anchorSelect={`#command-menu-item-entry-${command.key}`}
              content={command.label}
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
