import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { TintedIconTile } from 'twenty-ui/components';
import { IconCheck, IconClock, type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledItem = styled.li`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledEarnedCredits = styled.span`
  color: ${themeCssVariables.color.green9};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  white-space: nowrap;
`;

const StyledPending = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing['0.5']};
`;

type OnboardingFreeCreditsChecklistItemProps = {
  Icon: IconComponent;
  label: string;
  description: string;
  earnedCreditsLabel?: string;
  pendingLabel?: string;
};

export const OnboardingFreeCreditsChecklistItem = ({
  Icon,
  label,
  description,
  earnedCreditsLabel,
  pendingLabel,
}: OnboardingFreeCreditsChecklistItemProps) => {
  const theme = useTheme();
  const isEarned = isDefined(earnedCreditsLabel);

  return (
    <StyledItem>
      <TintedIconTile
        Icon={isEarned ? IconCheck : Icon}
        color={isEarned ? 'green' : 'gray'}
      />
      <StyledText>
        <StyledLabel>{label}</StyledLabel>
        <StyledDescription>{description}</StyledDescription>
        {isDefined(pendingLabel) && (
          <StyledPending>
            <IconClock size={theme.icon.size.sm} />
            {pendingLabel}
          </StyledPending>
        )}
      </StyledText>
      {isEarned && (
        <StyledEarnedCredits>{earnedCreditsLabel}</StyledEarnedCredits>
      )}
    </StyledItem>
  );
};
