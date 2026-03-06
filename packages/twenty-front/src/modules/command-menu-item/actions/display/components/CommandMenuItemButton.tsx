import { type CommandMenuItemDisplayProps } from '@/command-menu-item/actions/display/components/CommandMenuItemDisplay';
import { getActionLabel } from '@/command-menu-item/utils/getActionLabel';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWrapper = styled.div`
  font-size: ${themeCssVariables.font.size.md};
`;

export const CommandMenuItemButton = ({
  action,
  onClick,
  to,
}: {
  action: CommandMenuItemDisplayProps;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  to?: string;
}) => {
  const label = getActionLabel(action.label);

  const shortLabel = isDefined(action.shortLabel)
    ? getActionLabel(action.shortLabel)
    : undefined;

  const buttonAccent = action.isPrimaryCTA ? 'blue' : 'default';

  return (
    <>
      {action.shortLabel ? (
        <Button
          Icon={action.Icon}
          size="small"
          variant="secondary"
          accent={buttonAccent}
          to={to}
          onClick={onClick}
          title={shortLabel}
          ariaLabel={label}
        />
      ) : (
        <div id={`action-menu-entry-${action.key}`} key={action.key}>
          <IconButton
            Icon={action.Icon}
            size="small"
            variant="secondary"
            accent={buttonAccent}
            to={to}
            onClick={onClick}
            ariaLabel={label}
          />
          <StyledWrapper>
            <AppTooltip
              anchorSelect={`#action-menu-entry-${action.key}`}
              content={label}
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
