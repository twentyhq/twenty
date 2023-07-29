import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/themes/effects';

import { useRegisterCloseCellHandlers } from '../../table/editable-cell/hooks/useRegisterCloseCellHandlers';

import { StyledDoubleTextContainer } from './InplaceInputDoubleText';

export const StyledInput = styled.input`
  margin: 0;
  width: 100%;
  ${textInputStyle}
`;

type OwnProps = {
  firstValuePlaceholder?: string;
  secondValuePlaceholder?: string;
  firstValue: string;
  secondValue: string;
  onSubmit: (newFirstValue: string, newSecondValue: string) => void;
};

export function InplaceInputDoubleTextCellEditMode({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  onSubmit,
}: OwnProps) {
  const [internalFirstValue, setInternalFirstValue] = useState(firstValue);
  const [internalSecondValue, setInternalSecondValue] = useState(secondValue);

  const wrapperRef = useRef(null);

  function handleSubmit() {
    onSubmit(internalFirstValue, internalSecondValue);
  }

  function handleCancel() {
    setInternalFirstValue(firstValue);
    setInternalSecondValue(secondValue);
  }

  function handleFirstValueChange(event: ChangeEvent<HTMLInputElement>) {
    setInternalFirstValue(event.target.value);
  }

  function handleSecondValueChange(event: ChangeEvent<HTMLInputElement>) {
    setInternalSecondValue(event.target.value);
  }

  useEffect(() => {
    setInternalFirstValue(firstValue);
  }, [firstValue]);

  useEffect(() => {
    setInternalSecondValue(secondValue);
  }, [secondValue]);

  useRegisterCloseCellHandlers(wrapperRef, handleSubmit, handleCancel);

  return (
    <StyledDoubleTextContainer ref={wrapperRef}>
      <StyledInput
        autoFocus
        placeholder={firstValuePlaceholder}
        value={internalFirstValue}
        onChange={handleFirstValueChange}
      />
      <StyledInput
        autoComplete="off"
        placeholder={secondValuePlaceholder}
        value={internalSecondValue}
        onChange={handleSecondValueChange}
      />
    </StyledDoubleTextContainer>
  );
}
