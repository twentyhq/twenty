import styled from '@emotion/styled';
import React, { ReactElement, forwardRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';

export type DatePickerProps = {
  isOpen?: boolean;
  date: Date;
  onChangeHandler: (date: Date) => void;
  customInput?: ReactElement;
};

const StyledContainer = styled.div`
  & .react-datepicker {
    border-color: ${(props) => props.theme.primaryBorder};
    font-family: 'Inter';
  }

  & .react-datepicker__triangle::after {
    display: none;
  }

  & .react-datepicker__triangle::before {
    display: none;
  }

  & .react-datepicker__header {
    background-color: ${(props) => props.theme.primaryBackground};
    border-bottom-color: ${(props) => props.theme.primaryBorder};
  }

  & .react-datepicker__day--selected {
    background-color: ${(props) => props.theme.blue};
  }
`;

function DatePicker({ date, onChangeHandler, customInput }: DatePickerProps) {
  const [startDate, setStartDate] = useState(date);

  type DivProps = React.HTMLProps<HTMLDivElement>;

  const DefaultDateDisplay = forwardRef<HTMLDivElement, DivProps>(
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
    <StyledContainer>
      <ReactDatePicker
        open={true}
        selected={startDate}
        onChange={(date: Date) => {
          setStartDate(date);
          onChangeHandler(date);
        }}
        customInput={customInput ? customInput : <DefaultDateDisplay />}
      />
    </StyledContainer>
  );
}

export default DatePicker;
