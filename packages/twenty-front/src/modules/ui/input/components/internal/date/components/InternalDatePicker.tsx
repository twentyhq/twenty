import ReactDatePicker from 'react-datepicker';
import styled from '@emotion/styled';
import { DateTime } from 'luxon';
import { Key } from 'ts-key-enum';
import { IconCalendarX, IconChevronLeft, IconChevronRight } from 'twenty-ui';

import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { DateTimeInput } from '@/ui/input/components/internal/date/components/DateTimeInput';
import {
  MONTH_AND_YEAR_DROPDOWN_ID,
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
  MonthAndYearDropdown,
} from '@/ui/input/components/internal/date/components/MonthAndYearDropdown';
import { TimeInput } from '@/ui/input/components/internal/date/components/TimeInput';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItemLeftContent } from '@/ui/navigation/menu-item/internals/components/MenuItemLeftContent';
import { StyledHoverableMenuItemBase } from '@/ui/navigation/menu-item/internals/components/StyledMenuItemBase';
import { OVERLAY_BACKGROUND } from '@/ui/theme/constants/OverlayBackground';
import { isDefined } from '~/utils/isDefined';

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

  & .react-datepicker__triangle {
    display: none;
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
    padding: 0;
  }

  &
    .react-datepicker__input-time-container
    .react-datepicker-time__input-container
    .react-datepicker-time__input {
    outline: none;
  }

  & .react-datepicker__header__dropdown {
    display: flex;
    color: ${({ theme }) => theme.font.color.primary};
    margin-left: ${({ theme }) => theme.spacing(1)};
    margin-bottom: ${({ theme }) => theme.spacing(10)};
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
    top: 6px;
    left: auto;

    & > span {
      margin-left: -6px;
    }
  }

  & .react-datepicker__navigation--next {
    right: 6px;
    top: 6px;

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
    color: ${({ theme }) => theme.grayScale.gray0};
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

const StyledCustomDatePickerHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};

  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledMonthText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export type InternalDatePickerProps = {
  date: Date;
  onMouseSelect?: (date: Date | null) => void;
  onChange?: (date: Date | null) => void;
  clearable?: boolean;
  isDateTimeInput?: boolean;
  onEnter?: (date: Date | null) => void;
  onEscape?: (date: Date | null) => void;
  keyboardEventsDisabled?: boolean;
  onClear?: () => void;
};

export const InternalDatePicker = ({
  date,
  onChange,
  onMouseSelect,
  onEnter,
  onEscape,
  clearable = true,
  isDateTimeInput,
  keyboardEventsDisabled,
  onClear,
}: InternalDatePickerProps) => {
  const internalDate = date ?? new Date();

  const monthLabel = DateTime.fromJSDate(internalDate).toFormat('LLLL');
  const yearLabel = DateTime.fromJSDate(internalDate).toFormat('yyyy');

  const { closeDropdown } = useDropdown(MONTH_AND_YEAR_DROPDOWN_ID);
  const { closeDropdown: closeDropdownMonthSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  );
  const { closeDropdown: closeDropdownYearSelect } = useDropdown(
    MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
  );

  const handleClear = () => {
    closeDropdowns();
    onClear?.();
  };

  const closeDropdowns = () => {
    closeDropdownYearSelect();
    closeDropdownMonthSelect();
    closeDropdown();
  };

  const handleMouseSelect = (newDate: Date) => {
    closeDropdowns();
    onMouseSelect?.(newDate);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isDefined(keyboardEventsDisabled) && keyboardEventsDisabled) {
      return;
    }

    switch (event.key) {
      case Key.Enter: {
        event.stopPropagation();
        event.preventDefault();

        closeDropdowns();
        onEnter?.(internalDate);
        break;
      }
      case Key.Escape: {
        event.stopPropagation();
        event.preventDefault();

        closeDropdowns();
        onEscape?.(internalDate);
        break;
      }
    }
  };

  return (
    <StyledContainer onKeyDown={handleKeyDown}>
      <div className={clearable ? 'clearable ' : ''}>
        <ReactDatePicker
          open={true}
          selected={internalDate}
          openToDate={internalDate}
          onChange={(newDate) => {
            onChange?.(newDate);
          }}
          customInput={
            <DateTimeInput
              date={internalDate}
              isDateTimeInput={isDateTimeInput}
              onChange={onChange}
            />
          }
          onMonthChange={(newDate) => {
            onChange?.(newDate);
          }}
          onYearChange={(newDate) => {
            onChange?.(newDate);
          }}
          renderCustomHeader={({
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <>
              <DateTimeInput
                date={internalDate}
                isDateTimeInput={isDateTimeInput}
                onChange={onChange}
              />
              <StyledCustomDatePickerHeader>
                {isDateTimeInput && (
                  <TimeInput date={internalDate} onChange={onChange} />
                )}
                <MonthAndYearDropdown date={internalDate} onChange={onChange} />
                <LightIconButton
                  Icon={IconChevronLeft}
                  onClick={() => decreaseMonth()}
                  size="medium"
                  disabled={prevMonthButtonDisabled}
                />
                <LightIconButton
                  Icon={IconChevronRight}
                  onClick={() => increaseMonth()}
                  size="medium"
                  disabled={nextMonthButtonDisabled}
                />
              </StyledCustomDatePickerHeader>
              <StyledMonthText>
                {monthLabel} - {yearLabel}
              </StyledMonthText>
            </>
          )}
          onSelect={(date: Date, event) => {
            const dateUTC = DateTime.fromJSDate(date, {
              zone: 'utc',
            }).toJSDate();

            if (event?.type === 'click') {
              handleMouseSelect?.(dateUTC);
            } else {
              onChange?.(dateUTC);
            }
          }}
        />
      </div>
      {clearable && (
        <StyledButtonContainer onClick={handleClear} isMenuOpen={false}>
          <StyledButton LeftIcon={IconCalendarX} text="Clear" />
        </StyledButtonContainer>
      )}
    </StyledContainer>
  );
};
