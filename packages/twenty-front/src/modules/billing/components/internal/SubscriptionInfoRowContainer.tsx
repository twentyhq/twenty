import { type IconComponent } from 'twenty-ui/display';
import React, { useContext } from 'react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type SubscriptionInfoRowContainerProps = {
  Icon: IconComponent;
  label: string;
  currentValue: React.ReactNode;
  nextValue?: React.ReactNode;
};

const StyledContainer = styled.div`
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  color: ${themeCssVariables.font.color.primary};
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;

const StyledIconLabelContainer = styled.div`
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

const StyledLabelContainer = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledHeaderText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const SubscriptionInfoHeaderRow = ({ show }: { show: boolean }) => {
  if (!show) return null;
  return (
    <StyledContainer>
      <div />
      <StyledHeaderText>{t`Current`}</StyledHeaderText>
      <StyledHeaderText>{t`Next`}</StyledHeaderText>
    </StyledContainer>
  );
};

export const SubscriptionInfoRowContainer = ({
  Icon,
  label,
  currentValue,
  nextValue,
}: SubscriptionInfoRowContainerProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <StyledIconLabelContainer>
        <Icon size={theme.icon.size.md} />
        <StyledLabelContainer>{label}</StyledLabelContainer>
      </StyledIconLabelContainer>
      {currentValue}
      <div>{nextValue ?? ''}</div>
    </StyledContainer>
  );
};
