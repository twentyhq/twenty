import { ViewCalendarLayout } from '~/generated-metadata/graphql';

type GetSupportedRecordCalendarLayoutArgs = {
  calendarLayout: ViewCalendarLayout | null | undefined;
  isCalendarWeekViewEnabled: boolean;
};

export const getSupportedRecordCalendarLayout = ({
  calendarLayout,
  isCalendarWeekViewEnabled,
}: GetSupportedRecordCalendarLayoutArgs) => {
  const isExperimentalLayout =
    calendarLayout === ViewCalendarLayout.DAY ||
    calendarLayout === ViewCalendarLayout.WEEK ||
    calendarLayout === ViewCalendarLayout.TIMELINE;

  return isCalendarWeekViewEnabled && isExperimentalLayout
    ? calendarLayout
    : ViewCalendarLayout.MONTH;
};
