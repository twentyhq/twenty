import { ChangeEvent, ReactElement, useRef, useState } from 'react';
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
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > input:last-child {
    padding-left: ${(props) => props.theme.spacing(2)};
    border-left: 1px solid ${(props) => props.theme.primaryBorder};
  }
`;

const StyledEditInplaceInput = styled.input`
  width: 45%;
  height: 18px;
  margin: 0px ${(props) => props.theme.spacing(2)};

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
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <EditableCell
      onInsideClick={() => setIsEditMode(true)}
      onOutsideClick={() => setIsEditMode(false)}
      isEditMode={isEditMode}
      editModeContent={
        <StyledContainer>
          <StyledEditInplaceInput
            autoFocus
            placeholder={firstValuePlaceholder}
            ref={firstValueInputRef}
            value={firstValue}
            tabIndex={0}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange(event.target.value, secondValue);
            }}
          />
          <StyledEditInplaceInput
            placeholder={secondValuePlaceholder}
            ref={firstValueInputRef}
            value={secondValue}
            tabIndex={0}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange(firstValue, event.target.value);
            }}
            onBlur={() => {
              setIsEditMode(false);
            }}
          />
        </StyledContainer>
      }
      nonEditModeContent={nonEditModeContent}
    ></EditableCell>
  );
}
