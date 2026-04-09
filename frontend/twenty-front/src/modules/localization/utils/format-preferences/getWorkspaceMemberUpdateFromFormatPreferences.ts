import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type WorkspaceMemberFormatPreferences } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { getWorkspaceDateFormatFromDateFormat } from '@/localization/utils/format-preferences/getWorkspaceDateFormatFromDateFormat';
import { getWorkspaceNumberFormatFromNumberFormat } from '@/localization/utils/format-preferences/getWorkspaceNumberFormatFromNumberFormat';
import { getWorkspaceTimeFormatFromTimeFormat } from '@/localization/utils/format-preferences/getWorkspaceTimeFormatFromTimeFormat';

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
