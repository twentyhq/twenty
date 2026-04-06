import { useEffect } from 'react';
import styled from '@emotion/styled';

type KeyboardShortcutsOverlayProps = {
  onClose: () => void;
};

const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const StyledCard = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
`;

const StyledTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(4)} 0;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  align-items: center;
`;

const StyledKey = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 28px;
  padding: 0 8px;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  font-family: ${({ theme }) => theme.font.family};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledAction = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledHint = styled.p`
  margin: ${({ theme }) => theme.spacing(4)} 0 0 0;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  text-align: center;
`;

const SHORTCUTS = [
  { key: '\u2192', action: 'Approve' },
  { key: '\u2190', action: 'Reject' },
  { key: '\u2193', action: 'Skip' },
  { key: '\u2191', action: 'Support' },
  { key: 'Enter', action: 'Confirm action' },
  { key: 'Esc', action: 'Cancel action' },
  { key: 'E', action: 'Edit' },
  { key: 'Z', action: 'Undo' },
  { key: '?', action: 'Toggle this help' },
];

export const KeyboardShortcutsOverlay = ({
  onClose,
}: KeyboardShortcutsOverlayProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <StyledOverlay onClick={onClose}>
      <StyledCard onClick={(e) => e.stopPropagation()}>
        <StyledTitle>Keyboard Shortcuts</StyledTitle>
        <StyledGrid>
          {SHORTCUTS.map(({ key, action }) => (
            <>
              <StyledKey key={key}>{key}</StyledKey>
              <StyledAction key={`action-${key}`}>{action}</StyledAction>
            </>
          ))}
        </StyledGrid>
        <StyledHint>Click anywhere or press Escape to dismiss</StyledHint>
      </StyledCard>
    </StyledOverlay>
  );
};
