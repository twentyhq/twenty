import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from 'twenty-shared/constants';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { getRelativeDateDisplayValue } from '@/object-record/object-filter-dropdown/utils/getRelativeDateDisplayValue';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { stringifyRelativeDateFilter } from '@/views/view-filter-value/utils/stringifyRelativeDateFilter';
import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { ViewFilterOperand, type FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  isDefined,
  resolveDateTimeFilter,
  type RelativeDateFilter,
  parseRecordFilterBetweenValue,
} from 'twenty-shared/utils';

import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';

type BetweenTab = 'start' | 'end';

const StyledBetweenContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledTabRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ isActive }) =>
      isActive ? themeCssVariables.color.blue : 'transparent'};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  transition:
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const safeInstantToZonedDateTime = (
  instantStr: string,
  timeZone: string,
): Temporal.ZonedDateTime | null => {
  if (!isNonEmptyString(instantStr)) return null;
  try {
    return Temporal.Instant.from(instantStr).toZonedDateTimeISO(timeZone);
  } catch {
    return null;
  }
};

export const ObjectFilterDropdownDateTimeInput = () => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { userTimezone } = useUserTimezone();
  const resolvedTimeZone = timeZone ?? userTimezone;

  const objectFilterDropdownCurrentRecordFilter = useAtomComponentStateValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const selectedOperandInDropdown = useAtomComponentStateValue(
    selectedOperandInDropdownComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const [activeTab, setActiveTab] = useState<BetweenTab>('start');

  const isBetween = selectedOperandInDropdown === ViewFilterOperand.IS_BETWEEN;

  const currentValue = objectFilterDropdownCurrentRecordFilter?.value || '';
  const { startValue: startStr, endValue: endStr } =
    parseRecordFilterBetweenValue(currentValue);

  const startZonedDateTime = safeInstantToZonedDateTime(
    startStr,
    resolvedTimeZone,
  );
  const endZonedDateTime = safeInstantToZonedDateTime(endStr, resolvedTimeZone);

  const formatInstantForDisplay = (instantStr: string): string => {
    if (!isNonEmptyString(instantStr)) return '';
    return formatDateTimeString({
      value: instantStr,
      timeZone: resolvedTimeZone,
      dateFormat,
      timeFormat,
      localeCatalog: dateLocale.localeCatalog,
    });
  };

  const buildBetweenDisplayValue = (
    newStartStr: string,
    newEndStr: string,
  ): string => {
    const startDisplay = formatInstantForDisplay(newStartStr);
    const endDisplay = formatInstantForDisplay(newEndStr);
    if (startDisplay && endDisplay) return `${startDisplay} → ${endDisplay}`;
    return '';
  };

  const handleBetweenStartChange = (newDate: Temporal.ZonedDateTime | null) => {
    const newStart = newDate?.toInstant().toString() ?? '';
    const newValue = `${newStart},${endStr}`;
    const displayValue = buildBetweenDisplayValue(newStart, endStr);
    applyObjectFilterDropdownFilterValue(newValue, displayValue);
  };

  const handleBetweenEndChange = (newDate: Temporal.ZonedDateTime | null) => {
    const newEnd = newDate?.toInstant().toString() ?? '';
    const newValue = `${startStr},${newEnd}`;
    const displayValue = buildBetweenDisplayValue(startStr, newEnd);
    applyObjectFilterDropdownFilterValue(newValue, displayValue);
  };

  if (isBetween) {
    return (
      <StyledBetweenContainer>
        <StyledTabRow role="tablist">
          <StyledTab
            role="tab"
            type="button"
            aria-selected={activeTab === 'start'}
            aria-controls="object-filter-dropdown-date-time-between-start"
            isActive={activeTab === 'start'}
            onClick={() => setActiveTab('start')}
          >
            <Trans>From</Trans>
          </StyledTab>
          <StyledTab
            role="tab"
            type="button"
            aria-selected={activeTab === 'end'}
            aria-controls="object-filter-dropdown-date-time-between-end"
            isActive={activeTab === 'end'}
            onClick={() => setActiveTab('end')}
          >
            <Trans>To</Trans>
          </StyledTab>
        </StyledTabRow>
        {activeTab === 'start' ? (
          <DateTimePicker
            instanceId="object-filter-dropdown-date-time-between-start"
            date={startZonedDateTime}
            onChange={handleBetweenStartChange}
            clearable={false}
          />
        ) : (
          <DateTimePicker
            instanceId="object-filter-dropdown-date-time-between-end"
            date={endZonedDateTime}
            onChange={handleBetweenEndChange}
            clearable={false}
          />
        )}
      </StyledBetweenContainer>
    );
  }

  const handleAbsoluteDateChange = (newDate: Temporal.ZonedDateTime | null) => {
    const newFilterValue = newDate?.toInstant().toString() ?? '';

    const formattedDateTime = formatDateTimeString({
      value: newFilterValue,
      timeZone: resolvedTimeZone,
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
          timezone: resolvedTimeZone,
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
      ? stringFilterValue.includes('T')
        ? safeInstantToZonedDateTime(stringFilterValue, resolvedTimeZone)
        : Temporal.PlainDate.from(stringFilterValue).toZonedDateTime(
            resolvedTimeZone,
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
