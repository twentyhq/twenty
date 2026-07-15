import { ViewCalendarLayout } from '~/generated-metadata/graphql';

type GetSupportedRecordCalendarLayoutArgs = {
  calendarLayout: ViewCalendarLayout | null | undefined;
  isCalendarWeekViewEnabled: boolean;
};

export const getSupportedRecordCalendarLayout = ({
  calendarLayout,
  isCalendarWeekViewEnabled,
}: GetSupportedRecordCalendarLayoutArgs) => {
  const isTimeGridLayout =
    calendarLayout === ViewCalendarLayout.DAY ||
    calendarLayout === ViewCalendarLayout.WEEK;

  return isCalendarWeekViewEnabled && isTimeGridLayout
    ? calendarLayout
    : ViewCalendarLayout.MONTH;
};
