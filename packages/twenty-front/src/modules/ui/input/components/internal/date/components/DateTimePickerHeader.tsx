import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Select } from '@/ui/input/components/Select';

import { DateTimePickerInput } from '@/ui/input/components/internal/date/components/DateTimePickerInput';
import { getMonthSelectOptions } from '@/ui/input/components/internal/date/utils/getMonthSelectOptions';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { type Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import {
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from './DateTimePicker';

const StyledCustomDatePickerHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};

  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledSeparator = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  height: 1px;
  width: 100%;
`;

const years = Array.from(
  { length: 200 },
  (_, i) => new Date().getFullYear() + 50 - i,
).map((year) => ({ label: year.toString(), value: year }));

type DateTimePickerHeaderProps = {
  date: Temporal.ZonedDateTime | null;
  onChange?: (date: Temporal.ZonedDateTime | null) => void;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
  onAddMonth: () => void;
  onSubtractMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
  hideInput?: boolean;
};

export const DateTimePickerHeader = ({
  date,
  onChange,
  onChangeMonth,
  onChangeYear,
  onAddMonth,
  onSubtractMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  hideInput = false,
}: DateTimePickerHeaderProps) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;

  return (
    <>
      {!hideInput && (
        <>
          <DateTimePickerInput date={date} onChange={onChange} />
          <StyledSeparator />
        </>
      )}
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
            value={date?.month ?? undefined}
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
            value={date?.year}
            options={years}
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
