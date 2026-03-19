import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';

import { type WaLabel } from '@/whatsapp-chat/types/WhatsAppTypes';
import { useSuppressHotkeys } from '@/whatsapp-chat/hooks/useSuppressHotkeys';

const PRESET_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6B7280', // gray
];

const StyledOverlay = styled.div`
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
`;

const StyledDropdown = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  min-width: 200px;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 101;
`;

const StyledInput = styled.input`
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

const StyledColorRow = styled.div`
  display: flex;
  gap: 4px;
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
`;

const StyledColorDot = styled.button<{ dotColor: string; isActive: boolean }>`
  background: ${({ dotColor }) => dotColor};
  border: 2px solid
    ${({ dotColor, isActive }) => (isActive ? dotColor : 'transparent')};
  border-radius: 50%;
  cursor: pointer;
  height: 20px;
  opacity: ${({ isActive }) => (isActive ? 1 : 0.5)};
  outline: ${({ isActive }) => (isActive ? '2px solid white' : 'none')};
  outline-offset: -3px;
  padding: 0;
  width: 20px;

  &:hover {
    opacity: 1;
  }
`;

const StyledAddButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
    color: ${({ theme }) => theme.font.color.primary};
  }

  &:disabled {
    color: ${({ theme }) => theme.font.color.light};
    cursor: default;
  }
`;

type LabelPickerProps = {
  existingLabels: WaLabel[];
  onAdd: (name: string, color: string) => Promise<unknown>;
  onClose: () => void;
};

export const LabelPicker = ({
  existingLabels,
  onAdd,
  onClose,
}: LabelPickerProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[4]);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleFocus: hotkeyFocus, handleBlur: hotkeyBlur } =
    useSuppressHotkeys('label-picker-input');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAdd = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);

    try {
      await onAdd(trimmed, color);
      setName('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  }, [name, color, submitting, onAdd, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAdd();
      }

      if (e.key === 'Escape') {
        onClose();
      }
    },
    [handleAdd, onClose],
  );

  return (
    <StyledOverlay onClick={onClose}>
      <StyledDropdown
        onClick={(e) => e.stopPropagation()}
      >
        <StyledInput
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={hotkeyFocus}
          onBlur={hotkeyBlur}
          placeholder="Label name…"
        />
        <StyledColorRow>
          {PRESET_COLORS.map((c) => (
            <StyledColorDot
              key={c}
              dotColor={c}
              isActive={c === color}
              onClick={() => setColor(c)}
            />
          ))}
        </StyledColorRow>
        <StyledAddButton
          disabled={!name.trim() || submitting}
          onClick={handleAdd}
        >
          {submitting ? 'Adding…' : 'Add label'}
        </StyledAddButton>
      </StyledDropdown>
    </StyledOverlay>
  );
};
