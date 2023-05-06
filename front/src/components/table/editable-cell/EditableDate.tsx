import styled from '@emotion/styled';
import { forwardRef, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';
import DatePicker from '../../form/DatePicker';
import { CalendarContainer } from 'react-datepicker';
import { modalBackground } from '../../../layout/styles/themes';

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
  width: 280px;
  box-shadow: 0px 3px 12px rgba(0, 0, 0, 0.09);
  z-index: 1;
  left: -10px;
  ${modalBackground};
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

  interface DatePickerContainerProps {
    className?: string;
    children: React.ReactNode;
  }

  const DatePickerContainer = ({
    className,
    children,
  }: DatePickerContainerProps) => {
    return (
      <StyledCalendarContainer>
        <CalendarContainer className={className}>
          <div style={{ position: 'relative' }}>{children}</div>
        </CalendarContainer>
      </StyledCalendarContainer>
    );
  };

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
            customContainer={DatePickerContainer}
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
