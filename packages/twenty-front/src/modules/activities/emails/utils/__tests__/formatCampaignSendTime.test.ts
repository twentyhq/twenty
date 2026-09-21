import { enUS } from 'date-fns/locale/en-US';

import { formatCampaignSendTime } from '@/activities/emails/utils/formatCampaignSendTime';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';

const FORMAT_PREFERENCES = {
  dateFormat: DateFormat.MONTH_FIRST,
  timeFormat: TimeFormat.HOUR_12,
  localeCatalog: enUS,
};

describe('formatCampaignSendTime', () => {
  it('names the time zone the send time is expressed in', () => {
    expect(
      formatCampaignSendTime({
        value: '2026-09-07T16:00:00.000Z',
        timeZone: 'America/New_York',
        ...FORMAT_PREFERENCES,
      }),
    ).toBe('Sep 7, 2026 12:00 PM EDT');
  });

  it('expresses the same instant in the reader time zone', () => {
    expect(
      formatCampaignSendTime({
        value: '2026-09-07T16:00:00.000Z',
        timeZone: 'Europe/Paris',
        ...FORMAT_PREFERENCES,
      }),
    ).toBe('Sep 7, 2026 6:00 PM GMT+2');
  });

  it('returns nothing when there is no send time', () => {
    expect(
      formatCampaignSendTime({
        value: null,
        timeZone: 'America/New_York',
        ...FORMAT_PREFERENCES,
      }),
    ).toBe('');
  });

  it('returns nothing when the send time is not a date', () => {
    expect(
      formatCampaignSendTime({
        value: 'not-a-date',
        timeZone: 'America/New_York',
        ...FORMAT_PREFERENCES,
      }),
    ).toBe('');
  });
});
