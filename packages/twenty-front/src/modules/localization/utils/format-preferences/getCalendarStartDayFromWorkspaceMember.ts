import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from 'twenty-shared/constants';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

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
