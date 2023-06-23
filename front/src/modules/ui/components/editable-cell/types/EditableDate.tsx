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
  align-items: center;
  display: flex;
  margin: 0px ${(props) => props.theme.spacing(2)};
`;

export type StyledCalendarContainerProps = {
  editModeHorizontalAlign?: 'left' | 'right';
};

const StyledCalendarContainer = styled.div<StyledCalendarContainerProps>`
  background: ${(props) => props.theme.secondaryBackground};
  border: 1px solid ${(props) => props.theme.primaryBorder};
  border-radius: 8px;
  box-shadow: ${(props) => props.theme.modalBoxShadow};
  left: -10px;
  position: absolute;
  top: 10px;
  z-index: 1;
`;
export function EditableDate({
  value,
  changeHandler,
  editModeHorizontalAlign,
}: EditableDateProps) {
  const [inputValue, setInputValue] = useState(value);

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
        <div>{inputValue && humanReadableDate(inputValue)}</div>
      }
    ></EditableCell>
  );
}
