import { type CalendarEventTargetFieldName } from 'src/front-components/types/calendar-event-target-field-name.type';

// Objects whose meetings core links through calendarEventTarget.
export const getCalendarEventTargetFieldName = (
  objectNameSingular: string | undefined,
): CalendarEventTargetFieldName | undefined => {
  switch (objectNameSingular) {
    case 'person':
      return 'targetPersonId';
    case 'company':
      return 'targetCompanyId';
    case 'opportunity':
      return 'targetOpportunityId';
    default:
      return undefined;
  }
};
