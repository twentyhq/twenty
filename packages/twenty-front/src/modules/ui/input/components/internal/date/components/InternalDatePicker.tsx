import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import styled from '@emotion/styled';
import { DateTime } from 'luxon';
import { IconCalendarX } from 'twenty-ui';

import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledHoverableMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { OVERLAY_BACKGROUND } from '@/ui/theme/constants/OverlayBackground';

import 'react-datepicker/dist/react-datepicker.css';

const StyledContainer = styled.div`
  & .react-datepicker {
    border-color: ${({ theme }) => theme.border.color.light};
    background: transparent;
    font-family: 'Inter';
    font-size: ${({ theme }) => theme.font.size.md};
    border: none;
    display: block;
    font-weight: ${({ theme }) => theme.font.weight.regular};
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

  & .react-datepicker-wrapper {
    display: none;
  }

  // Header

  & .react-datepicker__header {
    background: transparent;
    border: none;
  }

  & .react-datepicker__header__dropdown {
    display: flex;
    color: ${({ theme }) => theme.font.color.primary};
    margin-left: ${({ theme }) => theme.spacing(1)};
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }

  & .react-datepicker__month-dropdown-container,
  & .react-datepicker__year-dropdown-container {
    text-align: left;
    border-radius: ${({ theme }) => theme.border.radius.sm};
    margin-left: ${({ theme }) => theme.spacing(1)};
    margin-right: 0;
    padding: ${({ theme }) => theme.spacing(2)};
    padding-right: ${({ theme }) => theme.spacing(4)};
    background-color: ${({ theme }) => theme.background.tertiary};
  }

  & .react-datepicker__month-read-view--down-arrow,
  & .react-datepicker__year-read-view--down-arrow {
    height: 5px;
    width: 5px;
    border-width: 1px 1px 0 0;
    border-color: ${({ theme }) => theme.border.color.light};
    top: 3px;
    right: -6px;
  }

  & .react-datepicker__year-read-view,
  & .react-datepicker__month-read-view {
    padding-right: ${({ theme }) => theme.spacing(2)};
  }

  & .react-datepicker__month-dropdown-container {
    width: 80px;
  }

  & .react-datepicker__year-dropdown-container {
    width: 50px;
  }

  & .react-datepicker__month-dropdown,
  & .react-datepicker__year-dropdown {
    border: ${({ theme }) => theme.border.color.light};
    ${OVERLAY_BACKGROUND}
    overflow-y: scroll;
    top: ${({ theme }) => theme.spacing(2)};
  }
  & .react-datepicker__month-dropdown {
    left: ${({ theme }) => theme.spacing(2)};
    width: 160px;
    height: 260px;
  }

  & .react-datepicker__year-dropdown {
    left: calc(${({ theme }) => theme.spacing(9)} + 80px);
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
    padding: ${({ theme }) => theme.spacing(2)}
      calc(${({ theme }) => theme.spacing(2)} - 2px);
    width: calc(100% - ${({ theme }) => theme.spacing(4)});
    border-radius: ${({ theme }) => theme.border.radius.xs};
    color: ${({ theme }) => theme.font.color.secondary};
    cursor: pointer;
    margin: 2px;

    &:hover {
      background: ${({ theme }) => theme.background.transparent.light};
    }
  }

  & .react-datepicker__year-option {
    &:first-of-type,
    &:last-of-type {
      display: none;
    }
  }

  & .react-datepicker__current-month {
    display: none;
  }

  & .react-datepicker__day-name {
    color: ${({ theme }) => theme.font.color.secondary};
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
    border-radius: ${({ theme }) => theme.border.radius.sm};
    padding-top: 6px;
    &:hover {
      background: ${({ theme }) => theme.background.transparent.light};
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
    border-color: ${({ theme }) => theme.font.color.tertiary};
  }

  & .react-datepicker__day--keyboard-selected {
    background-color: inherit;
  }

  & .react-datepicker__day,
  .react-datepicker__time-name {
    color: ${({ theme }) => theme.font.color.primary};
  }

  & .react-datepicker__day--selected {
    background-color: ${({ theme }) => theme.color.blue};
    color: ${({ theme }) => theme.font.color.inverted};
  }

  & .react-datepicker__day--outside-month {
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  & .react-datepicker__day:hover {
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  & .clearable {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  }
`;

const StyledButtonContainer = styled(StyledHoverableMenuItemBase)`
  width: auto;
  height: ${({ theme }) => theme.spacing(8)};
  padding: 0 ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(2)};
`;

const StyledButton = styled(MenuItemLeftContent)`
  justify-content: start;
`;

export type InternalDatePickerProps = {
  date: Date | null;
  onMouseSelect?: (date: Date | null) => void;
  onChange?: (date: Date) => void;
  clearable?: boolean;
  isDateTimeInput?: boolean;
};

const StyledInputContainer = styled.div`
  width: 100%;
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  height: ${({ theme }) => theme.spacing(8)};
`;

const StyledInput = styled.input`
  background: ${({ theme }) => theme.background.secondary};
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  outline: none;
  padding: 8px;
  font-weight: 500;
  font-size: ${({ theme }) => theme.font.size.md};
  width: 100%;
`;

const PICKER_DATE_FORMAT = 'MM/dd/yyyy';

export const InternalDatePicker = ({
  date,
  onChange,
  onMouseSelect,
  clearable = true,
  isDateTimeInput,
}: InternalDatePickerProps) => {
  const handleClear = () => {
    onMouseSelect?.(null);
  };

  const initialDate = date
    ? DateTime.fromJSDate(date).toFormat(PICKER_DATE_FORMAT)
    : DateTime.now().toFormat(PICKER_DATE_FORMAT);

  const [dateValue, setDateValue] = useState(initialDate);

  const dateValueAsJSDate = DateTime.fromFormat(dateValue, PICKER_DATE_FORMAT)
    .isValid
    ? DateTime.fromFormat(dateValue, PICKER_DATE_FORMAT).toJSDate()
    : null;

  return (
    <StyledContainer>
      <div className={clearable ? 'clearable ' : ''}>
        <StyledInputContainer>
          <StyledInput
            type="text"
            placeholder={`Type date${
              isDateTimeInput ? ' and time' : ' (mm/dd/yyyy)'
            }`}
            inputMode="numeric"
            value={dateValue}
            onChange={(e) => {
              const inputValue = e.target.value;
              setDateValue(inputValue);

              if (!isDateTimeInput) {
                const parsedInputDate = DateTime.fromFormat(
                  inputValue,
                  PICKER_DATE_FORMAT,
                  { zone: 'utc' },
                );

                const isValid = parsedInputDate.isValid;

                if (isValid) {
                  onChange?.(parsedInputDate.toJSDate());
                }
              } else {
                // TODO: implement time also
                const parsedInputDate = DateTime.fromFormat(
                  inputValue,
                  PICKER_DATE_FORMAT,
                  { zone: 'utc' },
                );

                const isValid = parsedInputDate.isValid;

                if (isValid) {
                  onChange?.(parsedInputDate.toJSDate());
                }
              }
            }}
          />
        </StyledInputContainer>

        <ReactDatePicker
          open={true}
          selected={dateValueAsJSDate}
          value={dateValue}
          showMonthDropdown
          showYearDropdown
          onChange={() => {
            // We need to use onSelect here but onChange is almost redundant with onSelect but is require
          }}
          customInput={<></>}
          onSelect={(date: Date, event) => {
            // Setting the time to midnight might sometimes return the previous day
            // We set to 21:00 to avoid any timezone issues
            const dateForDateField = new Date(date.setHours(21, 0, 0, 0));

            setDateValue(
              DateTime.fromJSDate(date).toFormat(PICKER_DATE_FORMAT),
            );

            if (event?.type === 'click') {
              onMouseSelect?.(isDateTimeInput ? date : dateForDateField);
            } else {
              onChange?.(isDateTimeInput ? date : dateForDateField);
            }
          }}
        ></ReactDatePicker>
      </div>
      {clearable && (
        <StyledButtonContainer onClick={handleClear} isMenuOpen={false}>
          <StyledButton LeftIcon={IconCalendarX} text="Clear" />
        </StyledButtonContainer>
      )}
    </StyledContainer>
  );
};
