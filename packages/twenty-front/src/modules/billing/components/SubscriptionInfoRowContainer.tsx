import { IconComponent } from 'twenty-ui/display';
import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';

type SubscriptionInfoRowContainerProps = {
  Icon: IconComponent;
  label: string;
  value: React.ReactNode;
};

const StyledContainer = styled.div`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
`;

const StyledIconLabelContainer = styled.div`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  width: 120px;
`;

const StyledLabelContainer = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const SubscriptionInfoRowContainer = ({
  Icon,
  label,
  value,
}: SubscriptionInfoRowContainerProps) => {
  const theme = useTheme();
  return (
    <StyledContainer>
      <StyledIconLabelContainer>
        <Icon size={theme.icon.size.md} />
        <StyledLabelContainer>{label}</StyledLabelContainer>
      </StyledIconLabelContainer>
      {value}
    </StyledContainer>
  );
};
