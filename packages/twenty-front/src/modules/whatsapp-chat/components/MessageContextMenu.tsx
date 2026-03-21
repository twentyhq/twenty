import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

import { type WaMessage } from '@/whatsapp-chat/types/WhatsAppTypes';

const StyledOverlay = styled.div`
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
`;

const StyledMenu = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  min-width: 160px;
  overflow: hidden;
  position: fixed;
  z-index: 101;
`;

const StyledMenuItem = styled.button<{ danger?: boolean }>`
  align-items: center;
  background: none;
  border: none;
  color: ${({ danger, theme }) =>
    danger ? theme.color.red : theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

type MessageContextMenuProps = {
  message: WaMessage;
  position: { x: number; y: number };
  onClose: () => void;
  onCopy: (message: WaMessage) => void;
  onEdit?: (message: WaMessage) => void;
  onDelete?: (message: WaMessage) => void;
  onForward?: (message: WaMessage) => void;
  onFlagLead?: () => void;
  onStrukturanalyse?: (message: WaMessage) => void;
};

export const MessageContextMenu = ({
  message,
  position,
  onClose,
  onCopy,
  onEdit,
  onDelete,
  onForward,
  onFlagLead,
  onStrukturanalyse,
}: MessageContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Measure menu height dynamically and flip upward if it would overflow
  const [menuHeight, setMenuHeight] = useState(0);

  useEffect(() => {
    if (menuRef.current) {
      setMenuHeight(menuRef.current.getBoundingClientRect().height);
    }
  });

  const adjustedX = Math.min(position.x, window.innerWidth - 180);
  const fitsBelow = position.y + (menuHeight || 200) <= window.innerHeight;
  const adjustedY = fitsBelow
    ? position.y
    : Math.max(4, position.y - (menuHeight || 200));

  return (
    <StyledOverlay onClick={onClose} onContextMenu={(e) => e.preventDefault()}>
      <StyledMenu
        ref={menuRef}
        style={{ left: adjustedX, top: adjustedY }}
        onClick={(e) => e.stopPropagation()}
      >
        {message.body && (
          <StyledMenuItem
            onClick={() => {
              onCopy(message);
              onClose();
            }}
          >
            Copy text
          </StyledMenuItem>
        )}

        {onForward && message.body && !message.isDeleted && (
          <StyledMenuItem
            onClick={() => {
              onForward(message);
              onClose();
            }}
          >
            Forward message
          </StyledMenuItem>
        )}

        {onFlagLead && (
          <StyledMenuItem
            onClick={() => {
              onFlagLead();
              onClose();
            }}
          >
            Flag lead
          </StyledMenuItem>
        )}

        {onStrukturanalyse && !message.fromAgent && message.hasMedia &&
          message.mediaMimetype?.startsWith('image/') && (
          <StyledMenuItem
            onClick={() => {
              onStrukturanalyse(message);
              onClose();
            }}
          >
            Strukturanalyse
          </StyledMenuItem>
        )}

        {onEdit && message.fromAgent && message.body && !message.isDeleted && (
          <StyledMenuItem
            onClick={() => {
              onEdit(message);
              onClose();
            }}
          >
            Edit message
          </StyledMenuItem>
        )}

        {onDelete && message.fromAgent && !message.isDeleted && (
          <StyledMenuItem
            danger
            onClick={() => {
              onDelete(message);
              onClose();
            }}
          >
            Delete message
          </StyledMenuItem>
        )}
      </StyledMenu>
    </StyledOverlay>
  );
};
