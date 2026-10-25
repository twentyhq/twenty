import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { Select } from '@/ui/input/components/Select';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { DatePickerInput } from '@/ui/input/components/internal/date/components/DatePickerInput';
import { getDatePickerDropdownIds } from '@/ui/input/components/internal/date/utils/getDatePickerDropdownIds';
import { DATE_PICKER_YEAR_SELECT_OPTIONS } from '@/ui/input/components/internal/date/constants/DatePickerYearSelectOptions';
import { getMonthSelectOptions } from '@/ui/input/components/internal/date/utils/getMonthSelectOptions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

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
  instanceId: string;
  date: string | null;
  viewedMonth?: string;
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
  instanceId,
  date,
  viewedMonth,
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

  const { monthSelectDropdownId, yearSelectDropdownId } =
    getDatePickerDropdownIds(instanceId);

  const dateParsed = isDefined(date) ? Temporal.PlainDate.from(date) : null;
  const displayedMonth = isDefined(viewedMonth)
    ? Temporal.PlainYearMonth.from(viewedMonth)
    : dateParsed;

  return (
    <>
      {!hideInput && <DatePickerInput date={date} onChange={onChange} />}
      <StyledCustomDatePickerHeader>
        <Select
          dropdownId={monthSelectDropdownId}
          options={getMonthSelectOptions(userLocale)}
          onChange={onChangeMonth}
          value={displayedMonth?.month}
          fullWidth
        />
        <Select
          dropdownId={yearSelectDropdownId}
          onChange={onChangeYear}
          value={displayedMonth?.year}
          options={DATE_PICKER_YEAR_SELECT_OPTIONS}
          fullWidth
        />
        <LightIconButton
          onClick={onSubtractMonth}
          size="md"
          disabled={prevMonthButtonDisabled}
          aria-label={t`Previous`}
        >
          <IconChevronLeft />
        </LightIconButton>
        <LightIconButton
          onClick={onAddMonth}
          size="md"
          disabled={nextMonthButtonDisabled}
          aria-label={t`Next`}
        >
          <IconChevronRight />
        </LightIconButton>
      </StyledCustomDatePickerHeader>
    </>
  );
};
