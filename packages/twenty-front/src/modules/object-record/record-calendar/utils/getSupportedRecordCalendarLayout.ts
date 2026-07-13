import { ViewCalendarLayout } from '~/generated-metadata/graphql';

type GetSupportedRecordCalendarLayoutArgs = {
  calendarLayout: ViewCalendarLayout | null | undefined;
  isCalendarWeekViewEnabled: boolean;
};

export const getSupportedRecordCalendarLayout = ({
  calendarLayout,
  isCalendarWeekViewEnabled,
}: GetSupportedRecordCalendarLayoutArgs) =>
  isCalendarWeekViewEnabled && calendarLayout === ViewCalendarLayout.WEEK
    ? ViewCalendarLayout.WEEK
    : ViewCalendarLayout.MONTH;
