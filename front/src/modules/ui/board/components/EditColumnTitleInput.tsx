import styled from '@emotion/styled';

import { useScopedHotkeys } from '@/lib/hotkeys/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/lib/hotkeys/hooks/useSetHotkeyScope';

import { ColumnHotkeyScope } from './ColumnHotkeyScope';

const StyledEditTitleInput = styled.input`
  background-color: transparent;
  border: none;
  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
  color: ${({ color }) => color};
  &:focus {
    color: ${({ color }) => color};
    font-weight: ${({ theme }) => theme.font.weight.medium};
    line-height: ${({ theme }) => theme.text.lineHeight};
  }
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  outline: none;
`;

export function EditColumnTitleInput({
  color,
  value,
  onChange,
  switchEditMode,
}: {
  color?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  switchEditMode: () => void;
}) {
  const setHotkeyScope = useSetHotkeyScope();
  setHotkeyScope(ColumnHotkeyScope.EditColumnName, { goto: false });

  useScopedHotkeys('enter', switchEditMode, ColumnHotkeyScope.EditColumnName);
  useScopedHotkeys('esc', switchEditMode, ColumnHotkeyScope.EditColumnName);
  return (
    <StyledEditTitleInput
      placeholder={'Enter column name'}
      color={color}
      autoFocus
      value={value}
      onChange={onChange}
    />
  );
}
