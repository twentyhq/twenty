import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

type UndoToastProps = {
  action: string;
  text: string;
  onUndo?: () => void;
  onDismiss: () => void;
};

const slideUp = keyframes`
  from {
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
`;

const StyledToast = styled.div`
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: #1f2937;
  color: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  animation: ${slideUp} 200ms ease-out;
`;

const StyledText = styled.span`
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledUndoButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: #ffffff;
  font-size: 13px;
  font-family: inherit;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StyledDismiss = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  cursor: pointer;
  padding: 0 0 0 4px;
  line-height: 1;

  &:hover {
    color: #ffffff;
  }
`;

export const UndoToast = ({
  text,
  onUndo,
  onDismiss,
}: UndoToastProps) => {
  return (
    <StyledToast>
      <StyledText>{text}</StyledText>
      {onUndo && <StyledUndoButton onClick={onUndo}>Undo</StyledUndoButton>}
      <StyledDismiss onClick={onDismiss}>&times;</StyledDismiss>
    </StyledToast>
  );
};
