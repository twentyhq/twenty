import styled from '@emotion/styled';
import { type ReactNode } from 'react';

export const StyledPageInfoContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

export const StyledPageInfoIcon = styled.div<{ iconColor?: string }>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ iconColor }) => iconColor};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const StyledPageInfoTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(0.5)};
  min-width: 0;
`;

export const StyledPageInfoTitleContainer = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding-inline: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
  max-width: 150px;
`;

export const StyledPageInfoLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  white-space: nowrap;
  flex-shrink: 0;
`;

type CommandMenuPageInfoLayoutProps = {
  icon?: ReactNode;
  iconColor?: string;
  title: ReactNode;
  label?: ReactNode;
};

export const CommandMenuPageInfoLayout = ({
  icon,
  iconColor,
  title,
  label,
}: CommandMenuPageInfoLayoutProps) => {
  return (
    <StyledPageInfoContainer>
      {icon && (
        <StyledPageInfoIcon iconColor={iconColor}>{icon}</StyledPageInfoIcon>
      )}
      <StyledPageInfoTextContainer>
        <StyledPageInfoTitleContainer>{title}</StyledPageInfoTitleContainer>
        {label && <StyledPageInfoLabel>{label}</StyledPageInfoLabel>}
      </StyledPageInfoTextContainer>
    </StyledPageInfoContainer>
  );
};
