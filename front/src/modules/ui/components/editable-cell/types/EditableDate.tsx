import { forwardRef, useState } from 'react';
import styled from '@emotion/styled';

import { humanReadableDate } from '@/utils/utils';

import DatePicker from '../../form/DatePicker';
import { EditableCell } from '../EditableCell';

export type EditableDateProps = {
  value: Date;
  changeHandler: (date: Date) => void;
  editModeHorizontalAlign?: 'left' | 'right';
};

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0px ${(props) => props.theme.spacing(2)};
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
export function EditableDate({
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
      disableFocus={true}
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
        <div>{inputValue && humanReadableDate(inputValue)}</div>
      }
    ></EditableCell>
  );
}
