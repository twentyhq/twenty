import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledTag = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.color.green3};
  border: 1px solid ${themeCssVariables.color.green4};
  border-radius: ${themeCssVariables.border.radius.pill};
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
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledValue = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

type OnboardingPlanTagProps = {
  Icon: IconComponent;
  prefix?: string;
  value: string;
  suffix?: string;
};

export const OnboardingPlanTag = ({
  Icon,
  prefix,
  value,
  suffix,
}: OnboardingPlanTagProps) => {
  const theme = useTheme();

  return (
    <StyledTag>
      <Icon size={theme.icon.size.md} color={themeCssVariables.color.green9} />
      {isDefined(prefix) && <StyledLabel>{prefix}</StyledLabel>}
      <StyledValue>{value}</StyledValue>
      {isDefined(suffix) && <StyledLabel>{suffix}</StyledLabel>}
    </StyledTag>
  );
};
