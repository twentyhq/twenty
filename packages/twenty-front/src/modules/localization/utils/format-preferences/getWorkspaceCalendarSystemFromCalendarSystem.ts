import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { WorkspaceMemberCalendarSystemEnum } from '~/generated-metadata/graphql';

export const getWorkspaceCalendarSystemFromCalendarSystem = (
  calendarSystem: CalendarSystem,
): WorkspaceMemberCalendarSystemEnum => {
  switch (calendarSystem) {
    case CalendarSystem.SYSTEM:
      return WorkspaceMemberCalendarSystemEnum.SYSTEM;
    case CalendarSystem.GREGORIAN:
      return WorkspaceMemberCalendarSystemEnum.GREGORIAN;
    case CalendarSystem.PERSIAN:
      return WorkspaceMemberCalendarSystemEnum.PERSIAN;
    case CalendarSystem.ISLAMIC:
      return WorkspaceMemberCalendarSystemEnum.ISLAMIC;
  }
};
