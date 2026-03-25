import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsBillingLabelValueItemProps = {
  label: string;
  value: string;
  isValueInPrimaryColor?: boolean;
};

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledLabelSpan = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledValueSpan = styled.span<{ isPrimaryColor: boolean }>`
  color: ${({ isPrimaryColor }) =>
    isPrimaryColor
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

export const SettingsBillingLabelValueItem = ({
  label,
  value,
  isValueInPrimaryColor = false,
}: SettingsBillingLabelValueItemProps) => {
  return (
    <StyledContainer>
      <StyledLabelSpan>{label}</StyledLabelSpan>
      <StyledValueSpan isPrimaryColor={isValueInPrimaryColor}>
        {value}
      </StyledValueSpan>
    </StyledContainer>
  );
};
