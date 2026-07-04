import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { type McpSetupCard } from '@/settings/playground/types/McpSetup';
import { IconExternalLink } from 'twenty-ui/icon';
import { AppTooltip, Card, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledCard = styled(Card)`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  min-height: ${themeCssVariables.spacing[25]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[3]};
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledCardLogo = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 0 0 ${themeCssVariables.spacing[8]};
  height: ${themeCssVariables.spacing[8]};
  justify-content: center;
  width: ${themeCssVariables.spacing[8]};
`;

const StyledCardContent = styled.div`
  align-self: stretch;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  min-width: 0;
`;

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
  min-width: 0;
`;

const StyledCardTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCardBadge = styled.div`
  color: ${themeCssVariables.font.color.light};
  flex: 1 1 auto;
  font-size: ${themeCssVariables.font.size.md};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCardDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledInstallAction = styled.a`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.background.transparent.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex: 0 0 auto;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  padding: 0 ${themeCssVariables.spacing[2]};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  &[aria-disabled='true'] {
    color: ${themeCssVariables.font.color.light};
    cursor: not-allowed;
  }
`;

type SettingsMcpSetupCardActionProps = {
  card: McpSetupCard;
};

const SettingsMcpSetupCardAction = ({
  card,
}: SettingsMcpSetupCardActionProps) => {
  const theme = useTheme();

  if (card.isDisabled === true) {
    return (
      <>
        <StyledInstallAction
          as="span"
          aria-disabled="true"
          data-tooltip-id={card.tooltipId}
        >
          <IconExternalLink size={theme.icon.size.sm} />
          {card.ctaLabel}
        </StyledInstallAction>
        {isDefined(card.disabledTooltip) && isDefined(card.tooltipId) && (
          <AppTooltip
            anchorSelect={`[data-tooltip-id='${card.tooltipId}']`}
            content={card.disabledTooltip}
            delay={TooltipDelay.shortDelay}
            noArrow
            place="bottom"
            positionStrategy="fixed"
          />
        )}
      </>
    );
  }

  if (!isDefined(card.href)) {
    return null;
  }

  return (
    <StyledInstallAction
      href={card.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <IconExternalLink size={theme.icon.size.sm} />
      {card.ctaLabel}
    </StyledInstallAction>
  );
};

type SettingsMcpSetupCardProps = {
  card: McpSetupCard;
};

export const SettingsMcpSetupCard = ({ card }: SettingsMcpSetupCardProps) => (
  <StyledCard rounded backgroundColor={themeCssVariables.background.secondary}>
    <StyledCardLogo aria-hidden>{card.logo}</StyledCardLogo>
    <StyledCardContent>
      <StyledCardHeader>
        <StyledCardTitle>{card.title}</StyledCardTitle>
        <StyledCardBadge>{card.badge}</StyledCardBadge>
        <SettingsMcpSetupCardAction card={card} />
      </StyledCardHeader>
      <StyledCardDescription>{card.description}</StyledCardDescription>
    </StyledCardContent>
  </StyledCard>
);
