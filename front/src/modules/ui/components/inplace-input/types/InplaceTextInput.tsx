import { ChangeEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/themes/effects';

import { InplaceInput } from '../InplaceInput';

type OwnProps = {
  placeholder?: string;
  content: string;
  changeHandler: (updated: string) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  setSoftFocusOnCurrentInplaceInput?: () => void;
  hasSoftFocus?: boolean;
};

// TODO: refactor
const StyledInplaceInput = styled.input`
  margin: 0;
  width: 100%;
  ${textInputStyle}
`;

const StyledNoEditText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

export function InplaceTextInput({
  content,
  placeholder,
  changeHandler,
  editModeHorizontalAlign,
  setSoftFocusOnCurrentInplaceInput,
  hasSoftFocus,
}: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(content);

  return (
    <InplaceInput
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
      setSoftFocusOnCurrentInplaceInput={setSoftFocusOnCurrentInplaceInput}
      hasSoftFocus={hasSoftFocus}
      nonEditModeContent={<StyledNoEditText>{inputValue}</StyledNoEditText>}
    ></InplaceInput>
  );
}
