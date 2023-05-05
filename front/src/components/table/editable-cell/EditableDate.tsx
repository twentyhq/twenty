import styled from '@emotion/styled';
import { useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';
import DatePicker from '../../form/DatePicker';

export type EditableDateProps = {
  value: Date;
  changeHandler: (date: Date) => void;
  shouldAlignRight?: boolean;
};

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
`;
function EditableDate({
  value,
  changeHandler,
  shouldAlignRight,
}: EditableDateProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isEditMode, setIsEditMode] = useState(false);

  const onEditModeChange = (isEditMode: boolean) => {
    setIsEditMode(isEditMode);
  };

  return (
    <EditableCellWrapper
      onEditModeChange={onEditModeChange}
      shouldAlignRight={shouldAlignRight}
    >
      <StyledContainer>
        <DatePicker
          isOpen={isEditMode}
          date={inputValue}
          onChangeHandler={(date: Date) => {
            changeHandler(date);
            setInputValue(date);
          }}
        />
      </StyledContainer>
    </EditableCellWrapper>
  );
}

export default EditableDate;
