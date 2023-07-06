import { ReactNode } from 'react';
import styled from '@emotion/styled';

const StyledPropertyBoxItem = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  gap: 4px;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 32px;

  svg {
    align-items: center;
    color: ${({ theme }) => theme.font.color.tertiary};
    display: flex;
    gap: 10px;
    height: 16px;
    justify-content: center;
    width: 16px;
  }
`;

const StyledLabelContainer = styled.div`
  align-content: flex-start;
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex: 1 0 0;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px;

  div {
    display: flex;
    height: 20px;
    padding: 0px 4px;
    align-items: center;
    gap: 4px;
  }

  a {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

export function PropertyBoxItem({
  icon,
  label,
  value,
  link,
}: {
  icon: ReactNode;
  label?: string;
  value: string;
  link?: string;
}) {
  return (
    <StyledPropertyBoxItem>
      <div>
        <StyledIconContainer>{icon}</StyledIconContainer>
        {label}
      </div>
      <StyledLabelContainer>
        <div>{link ? <a href={link}>{value}</a> : <>{value}</>}</div>
      </StyledLabelContainer>
    </StyledPropertyBoxItem>
  );
}
