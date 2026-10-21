import { getIconPickerSearchScore } from '@/ui/input/utils/getIconPickerSearchScore';

describe('getIconPickerSearchScore', () => {
  it('ranks exact, prefix and partial label matches', () => {
    expect(
      getIconPickerSearchScore({ iconKey: 'IconCalendar', search: 'Calendar' }),
    ).toBe(100);
    expect(
      getIconPickerSearchScore({
        iconKey: 'IconCalendarEvent',
        search: ' calendar event ',
      }),
    ).toBe(100);
    expect(
      getIconPickerSearchScore({ iconKey: 'IconCalendar', search: 'cal' }),
    ).toBe(75);
    expect(
      getIconPickerSearchScore({ iconKey: 'IconTrafficCone', search: 'cone' }),
    ).toBe(50);
  });

  it('does not match the icon prefix of unrelated icons', () => {
    expect(
      getIconPickerSearchScore({ iconKey: 'IconCalendar', search: 'ic' }),
    ).toBe(0);
    expect(
      getIconPickerSearchScore({ iconKey: 'IconIceCream', search: 'ic' }),
    ).toBe(75);
    expect(
      getIconPickerSearchScore({ iconKey: 'IconEdit', search: 'cone' }),
    ).toBe(0);
  });

  it('matches full icon keys', () => {
    expect(
      getIconPickerSearchScore({
        iconKey: 'IconCalendar',
        search: 'IconCalendar',
      }),
    ).toBe(100);
    expect(
      getIconPickerSearchScore({ iconKey: 'IconCalendar', search: 'iconcal' }),
    ).toBe(75);
    expect(
      getIconPickerSearchScore({ iconKey: 'IconIcons', search: 'icons' }),
    ).toBe(100);
  });
});
