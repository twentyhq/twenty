import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/themes/effects';

import { useRegisterCloseCellHandlers } from '../../table/editable-cell/hooks/useRegisterCloseCellHandlers';

export const StyledInput = styled.input`
  margin: 0;
  width: 100%;
  ${textInputStyle}
`;

type OwnProps = {
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  onSubmit: (newText: string) => void;
};

export function InplaceInputTextEditMode({
  placeholder,
  autoFocus,
  value,
  onSubmit,
}: OwnProps) {
  const [internalText, setInternalText] = useState(value);

  const wrapperRef = useRef(null);

  function handleSubmit() {
    onSubmit(internalText);
  }

  function handleCancel() {
    setInternalText(value);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setInternalText(event.target.value);
  }

  useEffect(() => {
    setInternalText(value);
  }, [value]);

  useRegisterCloseCellHandlers(wrapperRef, handleSubmit, handleCancel);

  return (
    <StyledInput
      ref={wrapperRef}
      placeholder={placeholder}
      onChange={handleChange}
      autoFocus={autoFocus}
      value={internalText}
    />
  );
}
