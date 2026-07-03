import { styled } from '@linaria/react';

import { type McpSetupCard } from '@/settings/playground/types/McpSetup';
import { IconExternalLink } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledSetupCard = styled.article`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  min-height: ${themeCssVariables.spacing[25]};
  min-width: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[3]};
  padding-left: ${themeCssVariables.spacing[4]};
`;

const StyledCardLogo = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 0 0 ${themeCssVariables.spacing[8]};
  height: ${themeCssVariables.spacing[8]};
  justify-content: center;
  overflow: visible;
  width: ${themeCssVariables.spacing[8]};

  > svg {
    display: block;
    height: 100%;
    width: 100%;
  }
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
  line-height: ${themeCssVariables.text.lineHeight.lg};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCardBadge = styled.div`
  color: ${themeCssVariables.font.color.light};
  flex: 1 1 auto;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledCardDescription = styled.div`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${themeCssVariables.font.color.secondary};
  display: -webkit-box;
  font-size: ${themeCssVariables.font.size.sm};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  overflow: hidden;
`;

const StyledInstallActionStyles = `
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.background.transparent.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex: 0 0 auto;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  padding: 0 ${themeCssVariables.spacing[2]};
  text-decoration: none;
  white-space: nowrap;
`;

const StyledInstallActionLink = styled.a`
  ${StyledInstallActionStyles}

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledInstallActionButton = styled.button`
  ${StyledInstallActionStyles}
  color: ${themeCssVariables.font.color.light};
  cursor: not-allowed;
  pointer-events: none;

  &:disabled {
    color: ${themeCssVariables.font.color.light};
  }
`;

const StyledDisabledActionTooltipAnchor = styled.span`
  display: inline-flex;
`;

type SettingsMcpSetupCardActionProps = {
  card: McpSetupCard;
};

const SettingsMcpSetupCardAction = ({
  card,
}: SettingsMcpSetupCardActionProps) => {
  const theme = useTheme();

  if (card.isDisabled && card.disabledTooltip && card.tooltipId) {
    return (
      <>
        <StyledDisabledActionTooltipAnchor data-tooltip-id={card.tooltipId}>
          <StyledInstallActionButton disabled type="button">
            <IconExternalLink size={theme.icon.size.sm} />
            {card.ctaLabel}
          </StyledInstallActionButton>
        </StyledDisabledActionTooltipAnchor>
        <AppTooltip
          anchorSelect={`[data-tooltip-id='${card.tooltipId}']`}
          content={card.disabledTooltip}
          delay={TooltipDelay.shortDelay}
          noArrow
          place="bottom"
          positionStrategy="fixed"
        />
      </>
    );
  }

  if (card.href === undefined) {
    return null;
  }

  return (
    <StyledInstallActionLink
      href={card.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <IconExternalLink size={theme.icon.size.sm} />
      {card.ctaLabel}
    </StyledInstallActionLink>
  );
};

type SettingsMcpSetupCardProps = {
  card: McpSetupCard;
};

export const SettingsMcpSetupCard = ({ card }: SettingsMcpSetupCardProps) => (
  <StyledSetupCard>
    <StyledCardLogo aria-hidden>{card.logo}</StyledCardLogo>
    <StyledCardContent>
      <StyledCardHeader>
        <StyledCardTitle>{card.title}</StyledCardTitle>
        <StyledCardBadge>{card.badge}</StyledCardBadge>
        <SettingsMcpSetupCardAction card={card} />
      </StyledCardHeader>
      <StyledCardDescription>{card.description}</StyledCardDescription>
    </StyledCardContent>
  </StyledSetupCard>
);
