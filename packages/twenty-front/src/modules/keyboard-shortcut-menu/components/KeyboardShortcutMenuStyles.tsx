import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const StyledDialog = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  font-family: ${({ theme }) => theme.font.family};
  left: 50%;
  max-width: 400px;
  overflow: hidden;
  padding: 0;
  padding: ${({ theme }) => theme.spacing(1)};
  position: fixed;
  top: 30%;
  transform: ${() =>
    useIsMobile() ? 'translateX(-49.5%)' : 'translateX(-50%)'};
  width: ${() => (useIsMobile() ? 'calc(100% - 40px)' : '100%')};
  z-index: 1000;
`;

export const StyledHeading = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const StyledContainer = styled.div`
  gap: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(4)};
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

export const StyledGroupHeading = styled.label`
  color: ${({ theme }) => theme.color.gray10};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

export const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledItem = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.regular};
  height: 24px;
  justify-content: space-between;
`;

export const StyledShortcutKey = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.underline};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  height: 20px;
  justify-content: center;
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(1)};
  text-align: center;
`;

export const StyledShortcutKeyContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;
