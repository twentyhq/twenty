import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledTag = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.color.green3};
  border: 1px solid ${themeCssVariables.color.green4};
  border-radius: ${themeCssVariables.border.radius.pill};
  box-sizing: border-box;
  color: ${themeCssVariables.color.green9};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  padding: 0 ${themeCssVariables.spacing[2]} 0
    ${themeCssVariables.spacing['1.5']};
`;

const StyledPrefix = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledDuration = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSuffix = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

type OnboardingTrialExtensionTagProps = {
  duration: number;
};

export const OnboardingTrialExtensionTag = ({
  duration,
}: OnboardingTrialExtensionTagProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledTag>
      <IconCalendarEvent
        size={theme.icon.size.md}
        color={themeCssVariables.color.green9}
      />
      <StyledPrefix>{t`Extended`}</StyledPrefix>
      <StyledDuration>{duration}</StyledDuration>
      <StyledSuffix>{t`days trial`}</StyledSuffix>
    </StyledTag>
  );
};
