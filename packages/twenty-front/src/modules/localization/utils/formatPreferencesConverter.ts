import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from '@/localization/constants/CalendarStartDay';
import { DateFormat } from '@/localization/constants/DateFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { type WorkspaceMemberFormatPreferences } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { detectCalendarStartDay } from '@/localization/utils/detectCalendarStartDay';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberNumberFormatEnum,
  WorkspaceMemberTimeFormatEnum,
} from '~/generated/graphql';

// Convert workspace member data to format preferences state
export const getFormatPreferencesFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): WorkspaceMemberFormatPreferences => {
  return {
    timeZone: getTimeZoneFromWorkspaceMember(workspaceMember),
    dateFormat: getDateFormatFromWorkspaceMember(workspaceMember),
    timeFormat: getTimeFormatFromWorkspaceMember(workspaceMember),
    numberFormat: getNumberFormatFromWorkspaceMember(workspaceMember),
    calendarStartDay: getCalendarStartDayFromWorkspaceMember(workspaceMember),
  };
};

// Individual format converters - from workspace member to state
export const getTimeZoneFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): string => {
  return workspaceMember.timeZone === 'system' || !workspaceMember.timeZone
    ? detectTimeZone()
    : workspaceMember.timeZone;
};

export const getDateFormatFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): DateFormat => {
  switch (workspaceMember.dateFormat) {
    case WorkspaceMemberDateFormatEnum.SYSTEM:
      return DateFormat[detectDateFormat()];
    case WorkspaceMemberDateFormatEnum.MONTH_FIRST:
      return DateFormat.MONTH_FIRST;
    case WorkspaceMemberDateFormatEnum.DAY_FIRST:
      return DateFormat.DAY_FIRST;
    case WorkspaceMemberDateFormatEnum.YEAR_FIRST:
      return DateFormat.YEAR_FIRST;
    default:
      return DateFormat[detectDateFormat()];
  }
};

export const getTimeFormatFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): TimeFormat => {
  switch (workspaceMember.timeFormat) {
    case WorkspaceMemberTimeFormatEnum.SYSTEM:
      return TimeFormat[detectTimeFormat()];
    case WorkspaceMemberTimeFormatEnum.HOUR_24:
      return TimeFormat.HOUR_24;
    case WorkspaceMemberTimeFormatEnum.HOUR_12:
      return TimeFormat.HOUR_12;
    default:
      return TimeFormat[detectTimeFormat()];
  }
};

export const getNumberFormatFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): NumberFormat => {
  switch (workspaceMember.numberFormat) {
    case WorkspaceMemberNumberFormatEnum.SYSTEM:
      return NumberFormat[detectNumberFormat()];
    case WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT:
      return NumberFormat.COMMAS_AND_DOT;
    case WorkspaceMemberNumberFormatEnum.SPACES_AND_COMMA:
      return NumberFormat.SPACES_AND_COMMA;
    case WorkspaceMemberNumberFormatEnum.DOTS_AND_COMMA:
      return NumberFormat.DOTS_AND_COMMA;
    case WorkspaceMemberNumberFormatEnum.APOSTROPHE_AND_DOT:
      return NumberFormat.APOSTROPHE_AND_DOT;
    default:
      return NumberFormat[detectNumberFormat()];
  }
};

export const getCalendarStartDayFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): CalendarStartDay => {
  const calendarStartDay = workspaceMember.calendarStartDay;

  if (
    calendarStartDay === CalendarStartDay.SYSTEM ||
    calendarStartDay == null
  ) {
    return CalendarStartDay[detectCalendarStartDay()];
  }

  return calendarStartDay as CalendarStartDay;
};

// Convert format preferences to workspace member update data
export const getWorkspaceMemberUpdateFromFormatPreferences = (
  preferences: Partial<WorkspaceMemberFormatPreferences>,
): Partial<CurrentWorkspaceMember> => {
  const update: Partial<CurrentWorkspaceMember> = {};

  if (preferences.timeZone !== undefined) {
    update.timeZone = preferences.timeZone;
  }

  if (preferences.dateFormat !== undefined) {
    update.dateFormat = getWorkspaceDateFormatFromDateFormat(
      preferences.dateFormat,
    );
  }

  if (preferences.timeFormat !== undefined) {
    update.timeFormat = getWorkspaceTimeFormatFromTimeFormat(
      preferences.timeFormat,
    );
  }

  if (preferences.numberFormat !== undefined) {
    update.numberFormat = getWorkspaceNumberFormatFromNumberFormat(
      preferences.numberFormat,
    );
  }

  if (preferences.calendarStartDay !== undefined) {
    update.calendarStartDay = preferences.calendarStartDay;
  }

  return update;
};

// Individual format converters - from state to workspace member
export const getWorkspaceDateFormatFromDateFormat = (
  dateFormat: DateFormat,
): WorkspaceMemberDateFormatEnum => {
  switch (dateFormat) {
    case DateFormat.SYSTEM:
      return WorkspaceMemberDateFormatEnum.SYSTEM;
    case DateFormat.MONTH_FIRST:
      return WorkspaceMemberDateFormatEnum.MONTH_FIRST;
    case DateFormat.DAY_FIRST:
      return WorkspaceMemberDateFormatEnum.DAY_FIRST;
    case DateFormat.YEAR_FIRST:
      return WorkspaceMemberDateFormatEnum.YEAR_FIRST;
    default:
      return WorkspaceMemberDateFormatEnum.SYSTEM;
  }
};

export const getWorkspaceTimeFormatFromTimeFormat = (
  timeFormat: TimeFormat,
): WorkspaceMemberTimeFormatEnum => {
  switch (timeFormat) {
    case TimeFormat.SYSTEM:
      return WorkspaceMemberTimeFormatEnum.SYSTEM;
    case TimeFormat.HOUR_24:
      return WorkspaceMemberTimeFormatEnum.HOUR_24;
    case TimeFormat.HOUR_12:
      return WorkspaceMemberTimeFormatEnum.HOUR_12;
    default:
      return WorkspaceMemberTimeFormatEnum.SYSTEM;
  }
};

export const getWorkspaceNumberFormatFromNumberFormat = (
  numberFormat: NumberFormat,
): WorkspaceMemberNumberFormatEnum => {
  switch (numberFormat) {
    case NumberFormat.SYSTEM:
      return WorkspaceMemberNumberFormatEnum.SYSTEM;
    case NumberFormat.COMMAS_AND_DOT:
      return WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT;
    case NumberFormat.SPACES_AND_COMMA:
      return WorkspaceMemberNumberFormatEnum.SPACES_AND_COMMA;
    case NumberFormat.DOTS_AND_COMMA:
      return WorkspaceMemberNumberFormatEnum.DOTS_AND_COMMA;
    case NumberFormat.APOSTROPHE_AND_DOT:
      return WorkspaceMemberNumberFormatEnum.APOSTROPHE_AND_DOT;
    default:
      return WorkspaceMemberNumberFormatEnum.SYSTEM;
  }
};
