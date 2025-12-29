import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from 'twenty-shared/constants';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { UserContext } from '@/users/contexts/UserContext';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { ViewFilterOperand, type FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  isDefined,
  resolveDateTimeFilter,
  type RelativeDateFilter,
} from 'twenty-shared/utils';

import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

export const ObjectFilterDropdownDateTimeInput = () => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { userTimezone } = useUserTimezone();

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const handleAbsoluteDateChange = (newDate: Temporal.ZonedDateTime | null) => {
    const newFilterValue = newDate?.toInstant().toString() ?? '';

    const formattedDateTime = formatDateTimeString({
      value: newFilterValue,
      timeZone,
      dateFormat,
      timeFormat,
      localeCatalog: dateLocale.localeCatalog,
    });

    const newDisplayValue = isDefined(newDate) ? formattedDateTime : '';

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

  const resolvedValue = objectFilterDropdownCurrentRecordFilter
    ? resolveDateTimeFilter(objectFilterDropdownCurrentRecordFilter)
    : null;

  const isRelativeDateFilter =
    objectFilterDropdownCurrentRecordFilter?.operand ===
      ViewFilterOperand.IS_RELATIVE &&
    isDefined(resolvedValue) &&
    typeof resolvedValue === 'object';

  const relativeDate = isRelativeDateFilter ? resolvedValue : undefined;
  const stringFilterValue =
    objectFilterDropdownCurrentRecordFilter?.operand !==
      ViewFilterOperand.IS_RELATIVE && typeof resolvedValue === 'string'
      ? resolvedValue
      : undefined;

  const internalZonedDateTime =
    !isRelativeDateFilter && isNonEmptyString(stringFilterValue)
      ? Temporal.Instant.from(stringFilterValue).toZonedDateTimeISO(
          timeZone ?? userTimezone,
        )
      : null;

  return (
    <DateTimePicker
      instanceId={`object-filter-dropdown-date-time-input`}
      relativeDate={relativeDate}
      isRelative={isRelativeDateFilter}
      date={internalZonedDateTime}
      onChange={handleAbsoluteDateChange}
      onRelativeDateChange={handleRelativeDateChange}
      clearable={false}
    />
  );
};
