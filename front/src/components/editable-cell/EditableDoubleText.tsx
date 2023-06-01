import styled from '@emotion/styled';
import { ChangeEvent, ReactElement, useRef, useState } from 'react';
import { EditableCell } from './EditableCell';
import { textInputStyle } from '../../layout/styles/themes';

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
