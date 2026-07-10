import {
  FieldMetadataType,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';

type CalendarDateField = {
  name: string;
  type: FieldMetadataType;
};

type GetRecordCalendarDateRangeOverlapFilterParams = {
  calendarField: CalendarDateField;
  calendarEndField: CalendarDateField | undefined;
  firstDayOfRange: string;
  nextDayAfterLastDayOfRange: string;
};

export const getRecordCalendarDateRangeOverlapFilter = ({
  calendarField,
  calendarEndField,
  firstDayOfRange,
  nextDayAfterLastDayOfRange,
}: GetRecordCalendarDateRangeOverlapFilterParams):
  | RecordGqlOperationFilter
  | undefined => {
  if (
    calendarField.type !== FieldMetadataType.DATE ||
    calendarEndField?.type !== FieldMetadataType.DATE
  ) {
    return undefined;
  }

  return {
    and: [
      {
        [calendarField.name]: {
          lt: nextDayAfterLastDayOfRange,
        },
      },
      {
        or: [
          {
            [calendarField.name]: {
              gte: firstDayOfRange,
            },
          },
          {
            [calendarEndField.name]: {
              gte: firstDayOfRange,
            },
          },
        ],
      },
    ],
  };
};
