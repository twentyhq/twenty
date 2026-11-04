import { getDatePickerWeekdayLabels } from '@/localization/utils/getDatePickerWeekdayLabels';

describe('getDatePickerWeekdayLabels', () => {
  it('should return short weekday labels starting on Sunday', () => {
    expect(getDatePickerWeekdayLabels('en-US')).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ]);
  });

  it('should format the weekday labels in the given locale', () => {
    expect(getDatePickerWeekdayLabels('fr-FR')).toEqual([
      'dim.',
      'lun.',
      'mar.',
      'mer.',
      'jeu.',
      'ven.',
      'sam.',
    ]);
  });
});
