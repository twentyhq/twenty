import { Temporal } from 'temporal-polyfill';
import { MOCKED_DATE } from '~/testing/constants/MockedDate';

export const getMockedDateWithOffset = (offset: Temporal.DurationLike) =>
  Temporal.Instant.from(MOCKED_DATE)
    .toZonedDateTimeISO('UTC')
    .add(offset)
    .toInstant()
    .toString({ fractionalSecondDigits: 3 });
