import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from 'twenty-shared/constants';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { UserContext } from '@/users/contexts/UserContext';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { type FirstDayOfTheWeek, ViewFilterOperand } from 'twenty-shared/types';
import {
  isDefined,
  type RelativeDateFilter,
  resolveDateFilter,
} from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateString } from '~/utils/string/formatDateString';

export const ObjectFilterDropdownDateInput = () => {
  const { dateFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const selectedOperandInDropdown = useRecoilComponentValue(
    selectedOperandInDropdownComponentState,
  );

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const handleAbsoluteDateChange = (newPlainDate: string | null) => {
    const newFilterValue = newPlainDate ?? '';

    // TODO: remove this and use getDisplayValue instead
    const formattedDate = formatDateString({
      value: newPlainDate,
      timeZone,
      dateFormat,
      localeCatalog: dateLocale.localeCatalog,
    });

    const newDisplayValue = isDefined(newPlainDate) ? formattedDate : '';

    applyObjectFilterDropdownFilterValue(newFilterValue, newDisplayValue);
  };

  const handleRelativeDateChange = (
    relativeDate: RelativeDateFilter | null,
  ) => {
    const userDefinedCalendarStartDay =
      CalendarStartDay[
        currentWorkspaceMember?.calendarStartDay ?? CalendarStartDay.SYSTEM
      ];
    const defaultSystemCalendarStartDay = detectCalendarStartDay();

    const resolvedCalendarStartDay = (
      userDefinedCalendarStartDay === CalendarStartDay[CalendarStartDay.SYSTEM]
        ? defaultSystemCalendarStartDay
        : userDefinedCalendarStartDay
    ) as FirstDayOfTheWeek;

    const newFilterValue = relativeDate
      ? stringifyRelativeDateFilter({
          ...relativeDate,
          timezone: timeZone,
          firstDayOfTheWeek: resolvedCalendarStartDay,
        })
      : '';

    const newDisplayValue = relativeDate
      ? getRelativeDateDisplayValue(relativeDate)
      : '';

    applyObjectFilterDropdownFilterValue(newFilterValue, newDisplayValue);
  };

  const isRelativeOperand =
    selectedOperandInDropdown === ViewFilterOperand.IS_RELATIVE;

  const handleClear = () => {
    isRelativeOperand
      ? handleRelativeDateChange(null)
      : handleAbsoluteDateChange(null);
  };
  const resolvedValue = objectFilterDropdownCurrentRecordFilter
    ? resolveDateFilter(objectFilterDropdownCurrentRecordFilter)
    : null;

  const relativeDate =
    resolvedValue && typeof resolvedValue === 'object'
      ? resolvedValue
      : undefined;

  const plainDateValue =
    resolvedValue && typeof resolvedValue === 'string'
      ? resolvedValue
      : undefined;

  return (
    <DatePicker
      instanceId={`object-filter-dropdown-date-input`}
      relativeDate={relativeDate}
      isRelative={isRelativeOperand}
      plainDateString={plainDateValue ?? null}
      onChange={handleAbsoluteDateChange}
      onRelativeDateChange={handleRelativeDateChange}
      onClear={handleClear}
    />
  );
};
