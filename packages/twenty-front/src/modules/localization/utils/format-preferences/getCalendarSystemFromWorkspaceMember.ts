import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { detectCalendarSystem } from '@/localization/utils/detection/detectCalendarSystem';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { WorkspaceMemberCalendarSystemEnum } from '~/generated-metadata/graphql';

export const getCalendarSystemFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): CalendarSystem => {
  switch (workspaceMember.calendarSystem) {
    case WorkspaceMemberCalendarSystemEnum.GREGORIAN:
      return CalendarSystem.GREGORIAN;
    case WorkspaceMemberCalendarSystemEnum.PERSIAN:
      return CalendarSystem.PERSIAN;
    case WorkspaceMemberCalendarSystemEnum.ISLAMIC:
      return CalendarSystem.ISLAMIC;
    case WorkspaceMemberCalendarSystemEnum.SYSTEM:
    default:
      return CalendarSystem[detectCalendarSystem()];
  }
};
