import styled from '@emotion/styled';
import { forwardRef, useState } from 'react';
import { EditableCell } from './EditableCell';
import DatePicker from '../form/DatePicker';
import { humanReadableDate } from '../../services/utils';

export type EditableDateProps = {
  value: Date;
  changeHandler: (date: Date) => void;
  editModeHorizontalAlign?: 'left' | 'right';
};

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
`;

export type StyledCalendarContainerProps = {
  editModeHorizontalAlign?: 'left' | 'right';
};

const StyledCalendarContainer = styled.div<StyledCalendarContainerProps>`
  position: absolute;
  border: 1px solid ${(props) => props.theme.primaryBorder};
  border-radius: 8px;
  box-shadow: 0px 3px 12px rgba(0, 0, 0, 0.09);
  z-index: 1;
  left: -10px;
  top: 10px;
  background: ${(props) => props.theme.secondaryBackground};
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
        {value && humanReadableDate(new Date(value as string))}
      </div>
    ),
  );

  interface DatePickerContainerProps {
    children: React.ReactNode;
  }

  const DatePickerContainer = ({ children }: DatePickerContainerProps) => {
    return <StyledCalendarContainer>{children}</StyledCalendarContainer>;
  };

  return (
    <EditableCell
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
            customCalendarContainer={DatePickerContainer}
          />
        </StyledContainer>
      }
      nonEditModeContent={
        <StyledContainer>
          <div>{inputValue && humanReadableDate(inputValue)}</div>
        </StyledContainer>
      }
    ></EditableCell>
  );
}

export default EditableDate;
