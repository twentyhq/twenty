import { ViewCalendarLayout } from '~/generated-metadata/graphql';

type GetSupportedRecordCalendarLayoutArgs = {
  calendarLayout: ViewCalendarLayout | null | undefined;
  isCalendarWeekViewEnabled: boolean;
};

export const getSupportedRecordCalendarLayout = ({
  calendarLayout,
  isCalendarWeekViewEnabled,
}: GetSupportedRecordCalendarLayoutArgs) => {
  const isWeekOrDayLayout =
    calendarLayout === ViewCalendarLayout.DAY ||
    calendarLayout === ViewCalendarLayout.WEEK;

  return isCalendarWeekViewEnabled && isWeekOrDayLayout
    ? calendarLayout
    : ViewCalendarLayout.MONTH;
};
