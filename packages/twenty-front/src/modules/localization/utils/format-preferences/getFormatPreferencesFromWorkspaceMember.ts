import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type WorkspaceMemberFormatPreferences } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { getCalendarStartDayFromWorkspaceMember } from '@/localization/utils/format-preferences/getCalendarStartDayFromWorkspaceMember';
import { getDateFormatFromWorkspaceMember } from '@/localization/utils/format-preferences/getDateFormatFromWorkspaceMember';
import { getNumberFormatFromWorkspaceMember } from '@/localization/utils/format-preferences/getNumberFormatFromWorkspaceMember';
import { getTimeFormatFromWorkspaceMember } from '@/localization/utils/format-preferences/getTimeFormatFromWorkspaceMember';
import { getTimeZoneFromWorkspaceMember } from '@/localization/utils/format-preferences/getTimeZoneFromWorkspaceMember';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

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
