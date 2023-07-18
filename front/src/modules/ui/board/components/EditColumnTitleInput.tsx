import React from 'react';
import styled from '@emotion/styled';

import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';

import { ColumnHotkeyScope } from './ColumnHotkeyScope';

const StyledEditTitleInput = styled.input`
  background-color: transparent;
  border: none;
  color: ${({ color }) => color};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
  font-weight: ${({ theme }) => theme.font.weight.medium};

  margin: 0;
  outline: none;
  padding: 0;
`;

export function EditColumnTitleInput({
  color,
  value,
  onChange,
  onFocusLeave,
}: {
  color?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocusLeave: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  useListenClickOutsideArrayOfRef({
    refs: [inputRef],
    callback: () => {
      onFocusLeave();
    },
  });
  const setHotkeyScope = useSetHotkeyScope();
  setHotkeyScope(ColumnHotkeyScope.EditColumnName, { goto: false });

  useScopedHotkeys('enter', onFocusLeave, ColumnHotkeyScope.EditColumnName);
  useScopedHotkeys('esc', onFocusLeave, ColumnHotkeyScope.EditColumnName);
  return (
    <StyledEditTitleInput
      ref={inputRef}
      placeholder={'Enter column name'}
      color={color}
      autoFocus
      value={value}
      onChange={onChange}
    />
  );
}
