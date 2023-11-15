import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const StyledDialog = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  font-family: ${({ theme }) => theme.font.family};
  left: 50%;
  max-width: 640px;
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

export const StyledInput = styled.input`
  background: ${({ theme }) => theme.background.primary};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 0;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  margin: 0;
  outline: none;
  padding: ${({ theme }) => theme.spacing(5)};
  width: 100%;
  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

export const StyledList = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  height: min(300px, var(--cmdk-list-height));
  max-height: 400px;
  overflow: auto;
  overscroll-behavior: contain;
  transition: 100ms ease;
  transition-property: height;
`;

export const StyledEmpty = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 64px;
  justify-content: center;
  white-space: pre-wrap;
`;
