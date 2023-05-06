import styled from '@emotion/styled';
import { forwardRef, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';
import DatePicker from '../../form/DatePicker';

export type EditableDateProps = {
  value: Date;
  changeHandler: (date: Date) => void;
  editModeHorizontalAlign?: 'left' | 'right';
};

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
`;
function EditableDate({
  value,
  changeHandler,
  editModeHorizontalAlign,
}: EditableDateProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isEditMode, setIsEditMode] = useState(false);

  type DivProps = React.HTMLProps<HTMLDivElement>;

  const DateDisplay = forwardRef<HTMLDivElement, DivProps>(
    ({ value, onClick }, ref) => (
      <div onClick={onClick} ref={ref}>
        {value &&
          new Intl.DateTimeFormat(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(new Date(value as string))}
      </div>
    ),
  );

  return (
    <EditableCellWrapper
      isEditMode={isEditMode}
      onOutsideClick={() => setIsEditMode(false)}
      onInsideClick={() => setIsEditMode(true)}
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <StyledContainer>
          <DatePicker
            date={inputValue}
            onChangeHandler={(date: Date) => {
              changeHandler(date);
              setInputValue(date);
            }}
            customInput={<DateDisplay />}
          />
        </StyledContainer>
      }
      nonEditModeContent={
        <StyledContainer>
          <div>
            {inputValue &&
              new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(inputValue)}
          </div>
        </StyledContainer>
      }
    ></EditableCellWrapper>
  );
}

export default EditableDate;
