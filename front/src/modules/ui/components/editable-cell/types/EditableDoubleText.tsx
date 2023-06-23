import { ChangeEvent, ReactElement, useRef } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/layout/styles/themes';

import { EditableCell } from '../EditableCell';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  nonEditModeContent: ReactElement;
  onChange: (firstValue: string, secondValue: string) => void;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;

  & > input:last-child {
    border-left: 1px solid ${(props) => props.theme.primaryBorder};
    padding-left: ${(props) => props.theme.spacing(2)};
  }
`;

const StyledEditInplaceInput = styled.input`
  height: 18px;
  margin: 0;
  width: 45%;

  ${textInputStyle}
`;

export function EditableDoubleText({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  nonEditModeContent,
  onChange,
}: OwnProps) {
  const firstValueInputRef = useRef<HTMLInputElement>(null);

  return (
    <EditableCell
      editModeContent={
        <StyledContainer>
          <StyledEditInplaceInput
            autoFocus
            placeholder={firstValuePlaceholder}
            ref={firstValueInputRef}
            value={firstValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange(event.target.value, secondValue);
            }}
          />
          <StyledEditInplaceInput
            placeholder={secondValuePlaceholder}
            ref={firstValueInputRef}
            value={secondValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange(firstValue, event.target.value);
            }}
          />
        </StyledContainer>
      }
      nonEditModeContent={nonEditModeContent}
    ></EditableCell>
  );
}
