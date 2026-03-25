import { styled } from '@linaria/react';

import { Select } from '@/ui/input/components/Select';

import { DatePickerInput } from '@/ui/input/components/internal/date/components/DatePickerInput';
import { getMonthSelectOptions } from '@/ui/input/components/internal/date/utils/getMonthSelectOptions';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';
const YEARS_SELECT_OPTIONS = Array.from(
  { length: 200 },
  (_, i) => new Date().getFullYear() + 50 - i,
).map((year) => ({ label: year.toString(), value: year }));

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
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
  hideInput?: boolean;
};

export const DatePickerHeader = ({
  date,
  onChange,
  onChangeMonth,
  onChangeYear,
  onAddMonth,
  onSubtractMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  hideInput = false,
}: DatePickerHeaderProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;

  const dateParsed = isDefined(date) ? Temporal.PlainDate.from(date) : null;

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
            options={getMonthSelectOptions(userLocale)}
            onChange={onChangeMonth}
            value={dateParsed?.month}
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
            value={dateParsed?.year}
            options={YEARS_SELECT_OPTIONS}
            fullWidth
          />
        </ClickOutsideListenerContext.Provider>
        <LightIconButton
          Icon={IconChevronLeft}
          onClick={onSubtractMonth}
          size="medium"
          disabled={prevMonthButtonDisabled}
        />
        <LightIconButton
          Icon={IconChevronRight}
          onClick={onAddMonth}
          size="medium"
          disabled={nextMonthButtonDisabled}
        />
      </StyledCustomDatePickerHeader>
    </>
  );
};
