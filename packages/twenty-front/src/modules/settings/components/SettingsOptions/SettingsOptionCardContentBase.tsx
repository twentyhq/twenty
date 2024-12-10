import styled from '@emotion/styled';

type StyledCardContentProps = {
  disabled?: boolean;
};

export const StyledSettingsOptionCardContent = styled.div<StyledCardContentProps>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => theme.background.secondary};
  padding: ${({ theme }) => theme.spacing(4)};
`;
export const StyledSettingsOptionCardIcon = styled.div`
  align-items: center;
  border: 2px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  height: ${({ theme }) => theme.spacing(7)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(7)};
  min-width: ${({ theme }) => theme.icon.size.md};
`;

export const StyledSettingsOptionCardTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const StyledSettingsOptionCardDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;
