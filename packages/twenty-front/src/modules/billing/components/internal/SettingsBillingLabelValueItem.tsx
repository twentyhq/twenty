import styled from '@emotion/styled';

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
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledValueSpan = styled.span<{ isPrimaryColor: boolean }>`
  color: ${({ theme, isPrimaryColor }) =>
    isPrimaryColor ? theme.font.color.primary : theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
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
