import { styled } from '@linaria/react';
import { Plural, useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledDivider = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTrial = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: 0 ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]};
`;

const StyledTrialRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 17px;
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

  return (
    <>
      <StyledDivider />
      <StyledTrial>
        <StyledTrialRow>
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
      </StyledTrial>
    </>
  );
};
