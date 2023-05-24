import styled from '@emotion/styled';
import { ChangeEvent, ReactElement, useRef, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';

type OwnProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  nonEditModeContent: ReactElement;
  changeHandler: (firstValue: string, secondValue: string) => void;
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
  border: none;
  outline: none;
  height: 18px;

  &::placeholder {
    font-weight: bold;
    color: ${(props) => props.theme.text20};
  }
`;

export function EditableDoubleText({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  nonEditModeContent,
  changeHandler,
}: OwnProps) {
  const firstValueInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <EditableCellWrapper
      onOutsideClick={() => setIsEditMode(false)}
      onInsideClick={() => setIsEditMode(true)}
      isEditMode={isEditMode}
      editModeContent={
        <StyledContainer>
          <StyledEditInplaceInput
            autoFocus
            placeholder={firstValuePlaceholder}
            ref={firstValueInputRef}
            value={firstValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              changeHandler(event.target.value, secondValue);
            }}
          />
          <StyledEditInplaceInput
            autoFocus
            placeholder={secondValuePlaceholder}
            ref={firstValueInputRef}
            value={secondValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              changeHandler(firstValue, event.target.value);
            }}
          />
        </StyledContainer>
      }
      nonEditModeContent={nonEditModeContent}
    ></EditableCellWrapper>
  );
}
