import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isDifferentZonedDateTime = (
  zonedDateTimeA: Nullable<Temporal.ZonedDateTime>,
  zonedDateTimeB: Nullable<Temporal.ZonedDateTime>,
) => {
  if (!isDefined(zonedDateTimeA) && !isDefined(zonedDateTimeB)) {
    return false;
  }

  if (!isDefined(zonedDateTimeA) || !isDefined(zonedDateTimeB)) {
    return true;
  }

  return Temporal.ZonedDateTime.compare(zonedDateTimeA, zonedDateTimeB) !== 0;
};
