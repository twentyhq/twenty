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
  const hasCompatibleDateRangeFields =
    (calendarField.type === FieldMetadataType.DATE &&
      calendarEndField?.type === FieldMetadataType.DATE) ||
    (calendarField.type === FieldMetadataType.DATE_TIME &&
      calendarEndField?.type === FieldMetadataType.DATE_TIME);

  if (!hasCompatibleDateRangeFields) {
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
