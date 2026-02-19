import styled from '@emotion/styled';

type StyledCardContentProps = {
  disabled?: boolean;
  alignItems?: 'center' | 'flex-start';
  fullHeight?: boolean;
};

export const StyledSettingsCardContent = styled.div<StyledCardContentProps>`
  align-items: ${({ alignItems }) => alignItems ?? 'center'};
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => theme.background.secondary};
  height: ${({ fullHeight }) => (fullHeight ? '100%' : 'auto')};
  padding: ${({ theme }) => theme.spacing(4)};
`;
export const StyledSettingsCardIcon = styled.div`
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

export const StyledSettingsCardTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const StyledSettingsCardTextContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

export const StyledSettingsCardDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  overflow: hidden;
  line-height: 1.5;

  a {
    position: relative;
    z-index: 1;
    pointer-events: auto;
  }
`;

export const StyledSettingsCardThirdLine = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;
