import { ChangeEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/layout/styles/themes';

import { EditableCell } from '../EditableCell';

type OwnProps = {
  placeholder?: string;
  content: string;
  changeHandler: (updated: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
};

// TODO: refactor
const StyledInplaceInput = styled.input`
  margin: 0;
  width: 100%;
  ${textInputStyle}
`;

const StyledNoEditText = styled.div`
  width: 100%;
`;

export function EditableText({
  content,
  placeholder,
  changeHandler,
  editModeHorizontalAlign,
}: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(content);

  return (
    <EditableCell
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <StyledInplaceInput
          placeholder={placeholder || ''}
          autoFocus
          ref={inputRef}
          value={inputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInputValue(event.target.value);
            changeHandler(event.target.value);
          }}
        />
      }
      nonEditModeContent={<StyledNoEditText>{inputValue}</StyledNoEditText>}
    ></EditableCell>
  );
}
