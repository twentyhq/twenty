import React, { forwardRef, ReactElement, useState } from 'react';
import ReactDatePicker, { CalendarContainerProps } from 'react-datepicker';
import styled from '@emotion/styled';

import { overlayBackground } from '../../layout/styles/themes';

import 'react-datepicker/dist/react-datepicker.css';

export type DatePickerProps = {
  isOpen?: boolean;
  date: Date;
  onChangeHandler: (date: Date) => void;
  customInput?: ReactElement;
  customCalendarContainer?(props: CalendarContainerProps): React.ReactNode;
};

const StyledContainer = styled.div`
  & .react-datepicker {
    border-color: ${(props) => props.theme.primaryBorder};
    background: transparent;
    font-family: 'Inter';
    font-size: ${(props) => props.theme.fontSizeMedium};
    border: none;
    display: block;
    font-weight: 400;
  }

  & .react-datepicker-popper {
    position: relative !important;
    inset: auto !important;
    transform: none !important;
    padding: 0 !important;
  }

  & .react-datepicker__triangle::after {
    display: none;
  }

  & .react-datepicker__triangle::before {
    display: none;
  }

  // Header

  & .react-datepicker__header {
    background: transparent;
    border: none;
  }

  & .react-datepicker__header__dropdown {
    display: flex;
    margin-left: ${(props) => props.theme.spacing(1)};
    margin-bottom: ${(props) => props.theme.spacing(1)};
  }

  & .react-datepicker__month-dropdown-container,
  & .react-datepicker__year-dropdown-container {
    text-align: left;
    border-radius: 4px;
    margin-left: ${(props) => props.theme.spacing(1)};
    margin-right: 0;
    padding: ${(props) => props.theme.spacing(2)};
    padding-right: ${(props) => props.theme.spacing(4)};
    background-color: ${(props) => props.theme.tertiaryBackground};
  }

  & .react-datepicker__month-read-view--down-arrow,
  & .react-datepicker__year-read-view--down-arrow {
    height: 5px;
    width: 5px;
    border-width: 1px 1px 0 0;
    border-color: ${(props) => props.theme.text40};
    top: 3px;
    right: -6px;
  }

  & .react-datepicker__year-read-view,
  & .react-datepicker__month-read-view {
    padding-right: ${(props) => props.theme.spacing(2)};
  }

  & .react-datepicker__month-dropdown-container {
    width: 80px;
  }

  & .react-datepicker__year-dropdown-container {
    width: 50px;
  }

  & .react-datepicker__month-dropdown,
  & .react-datepicker__year-dropdown {
    border: ${(props) => props.theme.primaryBorder};
    ${overlayBackground}
    overflow-y: scroll;
    top: ${(props) => props.theme.spacing(2)};
  }
  & .react-datepicker__month-dropdown {
    left: ${(props) => props.theme.spacing(2)};
    width: 160px;
    height: 260px;
  }

  & .react-datepicker__year-dropdown {
    left: calc(${(props) => props.theme.spacing(9)} + 80px);
    width: 100px;
    height: 260px;
  }

  & .react-datepicker__navigation--years {
    display: none;
  }

  & .react-datepicker__month-option--selected,
  & .react-datepicker__year-option--selected {
    display: none;
  }

  & .react-datepicker__year-option,
  & .react-datepicker__month-option {
    text-align: left;
    padding: ${(props) => props.theme.spacing(2)}
      calc(${(props) => props.theme.spacing(2)} - 2px);
    width: calc(100% - ${(props) => props.theme.spacing(4)});
    border-radius: 2px;
    color: ${(props) => props.theme.text60};
    cursor: pointer;
    margin: 2px;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    &:first-of-type {
      display: none;
    }

    &:last-of-type {
      display: none;
    }
  }

  & .react-datepicker__current-month {
    display: none;
  }

  & .react-datepicker__day-name {
    color: ${(props) => props.theme.text60};
    width: 34px;
    height: 40px;
    line-height: 40px;
  }

  & .react-datepicker__month-container {
    float: none;
  }

  // Days

  & .react-datepicker__month {
    margin-top: 0;
  }

  & .react-datepicker__day {
    width: 34px;
    height: 34px;
    line-height: 34px;
  }

  & .react-datepicker__navigation--previous,
  & .react-datepicker__navigation--next {
    height: 34px;
    border-radius: 4px;
    padding-top: 6px;
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
  & .react-datepicker__navigation--previous {
    right: 38px;
    top: 8px;
    left: auto;

    & > span {
      margin-left: -6px;
    }
  }

  & .react-datepicker__navigation--next {
    right: 6px;
    top: 8px;

    & > span {
      margin-left: 6px;
    }
  }

  & .react-datepicker__navigation-icon::before {
    height: 7px;
    width: 7px;
    border-width: 1px 1px 0 0;
    border-color: ${(props) => props.theme.text40};
  }

  & .react-datepicker__day--keyboard-selected {
    background-color: inherit;
  }

  & .react-datepicker__day,
  .react-datepicker__time-name {
    color: ${(props) => props.theme.text80};
  }

  & .react-datepicker__day--selected {
    background-color: ${(props) => props.theme.blue};
    color: ${(props) => props.theme.text0};
  }

  & .react-datepicker__day--outside-month {
    color: ${(props) => props.theme.text40};
  }

  & .react-datepicker__day:hover {
    color: ${(props) => props.theme.text40};
  }
`;

function DatePicker({
  date,
  onChangeHandler,
  customInput,
  customCalendarContainer,
}: DatePickerProps) {
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
        showMonthDropdown
        showYearDropdown
        onChange={(date: Date) => {
          setStartDate(date);
          onChangeHandler(date);
        }}
        customInput={customInput ? customInput : <DefaultDateDisplay />}
        calendarContainer={
          customCalendarContainer ? customCalendarContainer : undefined
        }
      />
    </StyledContainer>
  );
}

export default DatePicker;
