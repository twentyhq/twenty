import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';

describe('formatTimeZoneLabel', () => {
  it('should format the time zone label correctly when location is included in the label', () => {
    const ianaTimeZone = 'Europe/Paris';
    const expectedLabel = '(GMT+02:00) Central European Summer Time - Paris';

    const formattedLabel = formatTimeZoneLabel(ianaTimeZone);

    expect(formattedLabel).toEqual(expectedLabel);
  });

  it('should format the time zone label correctly when location is not included in the label', () => {
    const ianaTimeZone = 'America/New_York';
    const expectedLabel = '(GMT-04:00) Eastern Daylight Time - New York';

    const formattedLabel = formatTimeZoneLabel(ianaTimeZone);

    expect(formattedLabel).toEqual(expectedLabel);
  });
});
