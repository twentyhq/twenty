import { styled } from '@linaria/react';
import { Suspense, lazy, useContext, type ComponentType } from 'react';
import type { DatePickerProps as ReactDatePickerLibProps } from 'react-datepicker';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from 'twenty-shared/constants';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { DatePickerHeader } from '@/ui/input/components/internal/date/components/DatePickerHeader';
import {
  DATE_PICKER_CONTAINER_WIDTH,
  StyledDatePickerContainer,
} from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import 'react-datepicker/dist/react-datepicker.css';

import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import { isDefined, turnJSDateToPlainDate } from 'twenty-shared/utils';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
export const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

const DATE_PICKER_SKELETON_PADDING = 16;

const StyledSpacer = styled.div`
  height: ${themeCssVariables.spacing[2]};
  width: auto;
`;

const StyledDatePickerFallback = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 300px;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
  width: 280px;
`;

type DatePickerWithoutCalendarProps = {
  instanceId: string;

  date: Nullable<string>;

  onClose?: (date: string | null) => void;
  onChange?: (date: string | null) => void;

  onEnter?: (date: string | null) => void;
  onEscape?: (date: string | null) => void;
  keyboardEventsDisabled?: boolean;
};

type DatePickerPropsType = ReactDatePickerLibProps;

const ReactDatePicker = lazy<ComponentType<DatePickerPropsType>>(() =>
  import('react-datepicker').then((mod) => ({
    // react-datepicker ships CJS; under vite 8 this dynamic import's `default`
    // can be the module namespace ({ default: Component }) rather than the
    // component itself, so unwrap a nested default when present.
    default: ((mod.default as any)?.default ??
      mod.default) as unknown as ComponentType<DatePickerPropsType>,
  })),
);

export const DatePickerWithoutCalendar = ({
  date,
  onChange,
  onClose,
}: DatePickerWithoutCalendarProps) => {
  const { theme } = useContext(ThemeContext);
  const plainDate = isDefined(date) ? Temporal.PlainDate.from(date) : null;

  const { closeDropdown: closeDropdownMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeDropdownYearSelect } = useCloseDropdown();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const closeDropdowns = () => {
    closeDropdownYearSelect(MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID);
    closeDropdownMonthSelect(MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID);
  };

  const handleClose = (newDate: string) => {
    closeDropdowns();
    onClose?.(newDate);
  };

  const handleChangeMonth = (month: number) => {
    const newDate = plainDate?.with({ month: month });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleAddMonth = () => {
    const newDate = plainDate?.add({ months: 1 });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleSubtractMonth = () => {
    const newDate = plainDate?.subtract({ months: 1 });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleChangeYear = (year: number) => {
    const newDate = plainDate?.with({ year: year });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleDateChange = (datePicked: Date | null) => {
    if (!isDefined(datePicked)) {
      return;
    }
    const plainDatePicked = turnJSDateToPlainDate(datePicked);

    onChange?.(plainDatePicked.toString());
  };

  const handleDateSelect = (datePicked: Date | null) => {
    if (!isDefined(datePicked)) {
      return;
    }
    const plainDatePicked = turnJSDateToPlainDate(datePicked);

    handleClose?.(plainDatePicked.toString());
  };

  const calendarStartDay =
    currentWorkspaceMember?.calendarStartDay === CalendarStartDay.SYSTEM
      ? CalendarStartDay[detectCalendarStartDay()]
      : (currentWorkspaceMember?.calendarStartDay ?? undefined);

  const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateShiftedToISOString = plainDate
    ?.toZonedDateTime(systemTimeZone)
    .toInstant()
    .toString();

  const dateForDatePicker = isDefined(dateShiftedToISOString)
    ? new Date(dateShiftedToISOString)
    : null;

  return (
    <StyledDatePickerContainer hideCalendar={true}>
      <div>
        <Suspense
          fallback={
            <StyledDatePickerFallback>
              <SkeletonTheme
                baseColor={theme.background.tertiary}
                highlightColor={theme.background.transparent.lighter}
                borderRadius={2}
              >
                <Skeleton
                  width={
                    DATE_PICKER_CONTAINER_WIDTH - DATE_PICKER_SKELETON_PADDING
                  }
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={
                    DATE_PICKER_CONTAINER_WIDTH - DATE_PICKER_SKELETON_PADDING
                  }
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={
                    DATE_PICKER_CONTAINER_WIDTH - DATE_PICKER_SKELETON_PADDING
                  }
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={
                    DATE_PICKER_CONTAINER_WIDTH - DATE_PICKER_SKELETON_PADDING
                  }
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
              </SkeletonTheme>
            </StyledDatePickerFallback>
          }
        >
          <ReactDatePicker
            open={true}
            selected={dateForDatePicker}
            openToDate={dateForDatePicker ?? undefined}
            disabledKeyboardNavigation
            onChange={handleDateChange}
            calendarStartDay={
              calendarStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined
            }
            renderCustomHeader={({
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <>
                <DatePickerHeader
                  date={plainDate?.toString() ?? null}
                  onChange={onChange}
                  onChangeMonth={handleChangeMonth}
                  onChangeYear={handleChangeYear}
                  onAddMonth={handleAddMonth}
                  onSubtractMonth={handleSubtractMonth}
                  prevMonthButtonDisabled={prevMonthButtonDisabled}
                  nextMonthButtonDisabled={nextMonthButtonDisabled}
                  hideInput={true}
                />
                <StyledSpacer />
              </>
            )}
            onSelect={handleDateSelect}
          />
        </Suspense>
      </div>
    </StyledDatePickerContainer>
  );
};
