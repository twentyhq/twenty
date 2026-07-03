import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconCoins } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledTag = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.color.green3};
  border: 1px solid ${themeCssVariables.color.green4};
  border-radius: ${themeCssVariables.border.radius.xxl};
  box-sizing: border-box;
  color: ${themeCssVariables.color.green9};
  corner-shape: round;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  padding: 0 ${themeCssVariables.spacing[2]} 0
    ${themeCssVariables.spacing['1.5']};
`;

const StyledLabel = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
`;

const StyledSuffix = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4;
`;

type OnboardingCreditsRewardTagProps = {
  amount: number;
  suffix?: string;
};

export const OnboardingCreditsRewardTag = ({
  amount,
  suffix,
}: OnboardingCreditsRewardTagProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledTag>
      <IconCoins
        size={theme.icon.size.md}
        color={themeCssVariables.color.green9}
      />
      <StyledLabel>{t`Earn +${amount}`}</StyledLabel>
      <StyledSuffix>{suffix ?? t`free credits`}</StyledSuffix>
    </StyledTag>
  );
};
