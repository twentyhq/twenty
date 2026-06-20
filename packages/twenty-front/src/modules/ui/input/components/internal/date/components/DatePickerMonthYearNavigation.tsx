import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Select } from '@/ui/input/components/Select';
import { getMonthSelectOptions } from '@/ui/input/components/internal/date/utils/getMonthSelectOptions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

const YEARS_SELECT_OPTIONS = Array.from(
  { length: 200 },
  (_, index) => new Date().getFullYear() + 50 - index,
).map((year) => ({ label: year.toString(), value: year }));

const StyledMonthYearSelect = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledMonthYearNavigation = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type DatePickerMonthYearNavigationProps = {
  date: string | null;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
  onAddMonth: () => void;
  onSubtractMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
  variant?: 'default' | 'relative';
};

export const DatePickerMonthYearNavigation = ({
  date,
  onChangeMonth,
  onChangeYear,
  onAddMonth,
  onSubtractMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  variant = 'default',
}: DatePickerMonthYearNavigationProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;

  const dateParsed = isDefined(date) ? Temporal.PlainDate.from(date) : null;

  const wrapSelect = (select: ReactNode) =>
    variant === 'relative' ? (
      <StyledMonthYearSelect>{select}</StyledMonthYearSelect>
    ) : (
      select
    );

  const monthSelect = wrapSelect(
    <Select
      dropdownId={MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID}
      options={getMonthSelectOptions(userLocale)}
      onChange={onChangeMonth}
      value={dateParsed?.month}
      fullWidth
    />,
  );

  const yearSelect = wrapSelect(
    <Select
      dropdownId={MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID}
      onChange={onChangeYear}
      value={dateParsed?.year}
      options={YEARS_SELECT_OPTIONS}
      fullWidth
    />,
  );

  const navigationButtons = (
    <>
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
    </>
  );

  if (variant === 'relative') {
    return (
      <>
        <ClickOutsideListenerContext.Provider
          value={{
            excludedClickOutsideId: MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
          }}
        >
          {monthSelect}
        </ClickOutsideListenerContext.Provider>
        <ClickOutsideListenerContext.Provider
          value={{
            excludedClickOutsideId: MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
          }}
        >
          {yearSelect}
        </ClickOutsideListenerContext.Provider>
        {navigationButtons}
      </>
    );
  }

  return (
    <StyledMonthYearNavigation>
      <ClickOutsideListenerContext.Provider
        value={{
          excludedClickOutsideId: MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
        }}
      >
        {monthSelect}
      </ClickOutsideListenerContext.Provider>
      <ClickOutsideListenerContext.Provider
        value={{
          excludedClickOutsideId: MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
        }}
      >
        {yearSelect}
      </ClickOutsideListenerContext.Provider>
      {navigationButtons}
    </StyledMonthYearNavigation>
  );
};
