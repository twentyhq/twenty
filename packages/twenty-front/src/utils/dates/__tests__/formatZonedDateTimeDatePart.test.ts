import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { Temporal } from 'temporal-polyfill';
import { WorkspaceMemberDateFormatEnum } from '~/generated-metadata/graphql';
import { formatZonedDateTimeDatePart } from '~/utils/dates/formatZonedDateTimeDatePart';

const ZONED_DATE_TIME = Temporal.ZonedDateTime.from(
  '2026-09-26T12:00:00[Asia/Tehran]',
);

describe('formatZonedDateTimeDatePart', () => {
  it('should format the date part in the Gregorian calendar', () => {
    expect(
      formatZonedDateTimeDatePart(
        ZONED_DATE_TIME,
        WorkspaceMemberDateFormatEnum.MONTH_FIRST,
        CalendarSystem.GREGORIAN,
      ),
    ).toBe('Sep 26, 2026');
  });

  it('should format the date part in the Persian calendar', () => {
    expect(
      formatZonedDateTimeDatePart(
        ZONED_DATE_TIME,
        WorkspaceMemberDateFormatEnum.DAY_FIRST,
        CalendarSystem.PERSIAN,
      ),
    ).toBe('4 Mehr, 1405');
  });

  it('should format the date part in the Islamic calendar', () => {
    expect(
      formatZonedDateTimeDatePart(
        ZONED_DATE_TIME,
        WorkspaceMemberDateFormatEnum.YEAR_FIRST,
        CalendarSystem.ISLAMIC,
      ),
    ).toBe('1448 Rab. II 15');
  });
});
