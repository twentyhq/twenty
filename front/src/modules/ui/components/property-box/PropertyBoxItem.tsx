import { ReactNode } from 'react';
import styled from '@emotion/styled';

const StyledPropertyBoxItem = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: 4px;
  width: 100%;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 32px;

  svg {
    align-items: center;
    display: flex;
    gap: 10px;
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
  gap: 4px;
  padding: 6px;
  width: 100%;

  a {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledValueString = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 20px;
  padding: 0px 4px;
`;

const StyledLabelAndIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: 4px;
`;

export function PropertyBoxItem({
  icon,
  label,
  value,
  link,
}: {
  icon: ReactNode;
  label?: string;
  value: string | ReactNode;
  link?: string;
}) {
  return (
    <StyledPropertyBoxItem>
      <StyledLabelAndIconContainer>
        <StyledIconContainer>{icon}</StyledIconContainer>
        {label}
      </StyledLabelAndIconContainer>
      <StyledValueContainer>
        {link ? (
          <a href={link}>{value}</a>
        ) : typeof value === 'string' ? (
          <StyledValueString>{value}</StyledValueString>
        ) : (
          <>{value}</>
        )}
      </StyledValueContainer>
    </StyledPropertyBoxItem>
  );
}
