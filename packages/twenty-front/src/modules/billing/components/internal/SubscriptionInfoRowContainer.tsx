import { type IconComponent } from 'twenty-ui/display';
import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';

type SubscriptionInfoRowContainerProps = {
  Icon: IconComponent;
  label: string;
  currentValue: React.ReactNode;
  nextValue?: React.ReactNode;
};

const StyledContainer = styled.div`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  display: grid;
  grid-template-columns: repeat(3, 1fr);
`;

const StyledIconLabelContainer = styled.div`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
`;

const StyledLabelContainer = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledHeaderText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
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
  const theme = useTheme();
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
