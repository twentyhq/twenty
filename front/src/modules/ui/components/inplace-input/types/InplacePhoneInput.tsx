import { ChangeEvent, MouseEvent, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

import { textInputStyle } from '@/ui/themes/effects';

import { RawLink } from '../../links/RawLink';
import { InplaceInput } from '../InplaceInput';

type OwnProps = {
  placeholder?: string;
  value: string;
  changeHandler: (updated: string) => void;
  setSoftFocusOnCurrentInplaceInput?: () => void;
  hasSoftFocus?: boolean;
};

const StyledRawLink = styled(RawLink)`
  overflow: hidden;

  a {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

// TODO: refactor
const StyledEditInplaceInput = styled.input`
  margin: 0;
  width: 100%;
  ${textInputStyle}
`;

export function InplacePhoneInput({
  value,
  placeholder,
  changeHandler,
  setSoftFocusOnCurrentInplaceInput,
  hasSoftFocus,
}: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  return (
    <InplaceInput
      editModeContent={
        <StyledEditInplaceInput
          autoFocus
          placeholder={placeholder || ''}
          ref={inputRef}
          value={inputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInputValue(event.target.value);
            changeHandler(event.target.value);
          }}
        />
      }
      nonEditModeContent={
        <>
          {isValidPhoneNumber(inputValue) ? (
            <StyledRawLink
              href={parsePhoneNumber(inputValue, 'FR')?.getURI()}
              onClick={(event: MouseEvent<HTMLElement>) => {
                event.stopPropagation();
              }}
            >
              {parsePhoneNumber(inputValue, 'FR')?.formatInternational() ||
                inputValue}
            </StyledRawLink>
          ) : (
            <StyledRawLink href="#">{inputValue}</StyledRawLink>
          )}
        </>
      }
      setSoftFocusOnCurrentInplaceInput={setSoftFocusOnCurrentInplaceInput}
      hasSoftFocus={hasSoftFocus}
    />
  );
}
