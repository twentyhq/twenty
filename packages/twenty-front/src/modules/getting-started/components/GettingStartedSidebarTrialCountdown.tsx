import { styled } from '@linaria/react';
import { Plural, useLingui } from '@lingui/react/macro';
import { IconHourglassHigh } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledDivider = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTrialRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDaysLeft = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledTrialLabel = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTrialDays = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTrialDay = styled.span`
  background: ${themeCssVariables.background.transparent.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  corner-shape: round;
  flex: 1;
  height: ${themeCssVariables.spacing['1.5']};

  &[data-remaining] {
    background: ${themeCssVariables.color.amber10};
  }
`;

type GettingStartedSidebarTrialCountdownProps = {
  daysLeft: number;
  trialDays: number;
};

export const GettingStartedSidebarTrialCountdown = ({
  daysLeft,
  trialDays,
}: GettingStartedSidebarTrialCountdownProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <>
      <StyledDivider />
      <StyledTrialRow>
        <IconHourglassHigh size={theme.icon.size.md} />
        <StyledDaysLeft>
          <Plural value={daysLeft} one="# day left" other="# days left" />
        </StyledDaysLeft>
        <StyledTrialLabel>{t`Trial`}</StyledTrialLabel>
      </StyledTrialRow>
      <StyledTrialDays aria-hidden>
        {Array.from({ length: trialDays }, (_, index) => (
          <StyledTrialDay
            key={index}
            data-remaining={index >= trialDays - daysLeft || undefined}
          />
        ))}
      </StyledTrialDays>
    </>
  );
};
