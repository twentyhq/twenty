import { ReactNode } from 'react';
import styled from '@emotion/styled';

const StyledPropertyBoxItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 32px;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
    width: 16px;
  }
`;

const StyledValueContainer = styled.div`
  align-content: flex-start;
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex: 1 0 0;
  flex-wrap: wrap;
`;

const StyledLabelAndIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export function PropertyBoxItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label?: string;
  value: ReactNode;
}) {
  return (
    <StyledPropertyBoxItem>
      <StyledLabelAndIconContainer>
        <StyledIconContainer>{icon}</StyledIconContainer>
        {label}
      </StyledLabelAndIconContainer>
      <StyledValueContainer>{value}</StyledValueContainer>
    </StyledPropertyBoxItem>
  );
}
