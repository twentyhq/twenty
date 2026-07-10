import { ViewCalendarLayout } from '~/generated-metadata/graphql';

export const getSupportedRecordCalendarLayout = (
  calendarLayout: ViewCalendarLayout | null | undefined,
) =>
  calendarLayout === ViewCalendarLayout.WEEK
    ? ViewCalendarLayout.WEEK
    : ViewCalendarLayout.MONTH;
