import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { IconSearch, IconX } from 'twenty-ui/display';
import { useSuppressHotkeys } from '@/whatsapp-chat/hooks/useSuppressHotkeys';

const StyledSearchContainer = styled.div<{ isFocused?: boolean }>`
  align-items: center;
  background: #F5F6F7;
  border: 1px solid ${({ isFocused }) =>
    isFocused ? '#1A6CFF' : '#E5E7EB'};
  border-radius: 8px;
  display: flex;
  gap: 8px;
  padding: 6px 10px;
`;

const StyledSearchIcon = styled.div`
  align-items: center;
  color: #9CA3AF;
  display: flex;
  flex-shrink: 0;
`;

const StyledInput = styled.input`
  background: transparent;
  border: none;
  color: #111827;
  flex: 1;
  font-family: inherit;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #9CA3AF;
  }
`;

const StyledClearButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  padding: 0;

  &:hover {
    color: #374151;
  }
`;

type ConversationSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export const ConversationSearch = ({
  value,
  onChange,
}: ConversationSearchProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const { handleFocus: hotkeyFocus, handleBlur: hotkeyBlur } =
    useSuppressHotkeys('conversation-search-input');

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <StyledSearchContainer isFocused={isFocused}>
      <StyledSearchIcon>
        <IconSearch size={16} />
      </StyledSearchIcon>
      <StyledInput
        type="text"
        placeholder="Search conversations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        onFocus={(e) => { setIsFocused(true); hotkeyFocus(e); }}
        onBlur={(e) => { setIsFocused(false); hotkeyBlur(e); }}
      />
      {value && (
        <StyledClearButton onClick={handleClear}>
          <IconX size={14} />
        </StyledClearButton>
      )}
    </StyledSearchContainer>
  );
};
