export type RecordCalendarTimelineDayGroup = {
  day: string;
  recordIds: string[];
};

export type RecordCalendarTimelineMonthGroup = {
  month: string;
  days: RecordCalendarTimelineDayGroup[];
};
