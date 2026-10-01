import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type Temporal } from 'temporal-polyfill';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import {
  isDefined,
  turnPlainDateIntoUserTimeZoneInstantString,
} from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type DateFieldMetadataItem = Pick<FieldMetadataItem, 'name' | 'type'>;

// Matches records whose bar overlaps the window. Records without a usable end
// date render as one-day bars, so a start inside the window is enough for them.
export const buildRecordTimelineDateRangeFilter = ({
  startFieldMetadataItem,
  endFieldMetadataItem,
  windowFirstDay,
  windowLastDay,
  timeZone,
}: {
  startFieldMetadataItem: DateFieldMetadataItem;
  endFieldMetadataItem: DateFieldMetadataItem | undefined;
  windowFirstDay: Temporal.PlainDate;
  windowLastDay: Temporal.PlainDate;
  timeZone: string;
}): RecordGqlOperationFilter => {
  const toFilterValue = (
    fieldMetadataItem: DateFieldMetadataItem,
    day: Temporal.PlainDate,
  ) =>
    fieldMetadataItem.type === FieldMetadataType.DATE_TIME
      ? turnPlainDateIntoUserTimeZoneInstantString(day, timeZone)
      : day.toString();

  const dayAfterWindow = windowLastDay.add({ days: 1 });

  const startsBeforeWindowEnds = {
    [startFieldMetadataItem.name]: {
      lt: toFilterValue(startFieldMetadataItem, dayAfterWindow),
    },
  };

  const startsInsideWindow = {
    [startFieldMetadataItem.name]: {
      gte: toFilterValue(startFieldMetadataItem, windowFirstDay),
    },
  };

  if (!isDefined(endFieldMetadataItem)) {
    return { and: [startsBeforeWindowEnds, startsInsideWindow] };
  }

  const endsInsideOrAfterWindow = {
    [endFieldMetadataItem.name]: {
      gte: toFilterValue(endFieldMetadataItem, windowFirstDay),
    },
  };

  return {
    and: [
      startsBeforeWindowEnds,
      { or: [startsInsideWindow, endsInsideOrAfterWindow] },
    ],
  };
};
