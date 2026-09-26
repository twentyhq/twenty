import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { Select } from '@/ui/input/components/Select';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DatePickerInput } from '@/ui/input/components/internal/date/components/DatePickerInput';
import { getMonthSelectOptions } from '@/ui/input/components/internal/date/utils/getMonthSelectOptions';
import { getYearSelectOptions } from '@/ui/input/components/internal/date/utils/getYearSelectOptions';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

const StyledCustomDatePickerHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};

  padding-top: ${themeCssVariables.spacing[2]};
`;

type DatePickerHeaderProps = {
  date: string | null;
  onChange?: (date: string | null) => void;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
  onAddMonth: () => void;
  onSubtractMonth: () => void;
  hideInput?: boolean;
};

export const DatePickerHeader = ({
  date,
  onChange,
  onChangeMonth,
  onChangeYear,
  onAddMonth,
  onSubtractMonth,
  hideInput = false,
}: DatePickerHeaderProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;
  const { calendarSystem } = useDateTimeFormat();

  const calendarDate = (
    isDefined(date)
      ? Temporal.PlainDate.from(date)
      : Temporal.Now.plainDateISO()
  ).withCalendar(calendarSystem);

  return (
    <>
      {!hideInput && <DatePickerInput date={date} onChange={onChange} />}
      <StyledCustomDatePickerHeader>
        <ClickOutsideListenerContext.Provider
          value={{
            excludedClickOutsideId: MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
          }}
        >
          <Select
            dropdownId={MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID}
            options={getMonthSelectOptions({
              locale: userLocale,
              calendarSystem,
              calendarYear: calendarDate.year,
            })}
            onChange={onChangeMonth}
            value={isDefined(date) ? calendarDate.month : undefined}
            fullWidth
          />
        </ClickOutsideListenerContext.Provider>
        <ClickOutsideListenerContext.Provider
          value={{
            excludedClickOutsideId: MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
          }}
        >
          <Select
            dropdownId={MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID}
            onChange={onChangeYear}
            value={isDefined(date) ? calendarDate.year : undefined}
            options={getYearSelectOptions(calendarSystem)}
            fullWidth
          />
        </ClickOutsideListenerContext.Provider>
        <LightIconButton
          onClick={onSubtractMonth}
          size="md"
          aria-label={t`Previous`}
        >
          <IconChevronLeft />
        </LightIconButton>
        <LightIconButton onClick={onAddMonth} size="md" aria-label={t`Next`}>
          <IconChevronRight />
        </LightIconButton>
      </StyledCustomDatePickerHeader>
    </>
  );
};
