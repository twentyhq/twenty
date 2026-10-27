import { getMultipleRecordPickerLayoutDirection } from '@/object-record/record-picker/multiple-record-picker/utils/getMultipleRecordPickerLayoutDirection';

describe('getMultipleRecordPickerLayoutDirection', () => {
  it('keeps an explicit layout direction whatever the placement', () => {
    expect(
      getMultipleRecordPickerLayoutDirection({
        layoutDirection: 'search-bar-on-bottom',
        side: 'bottom',
        align: 'start',
      }),
    ).toBe('search-bar-on-bottom');
  });

  it('places the search on top when the popup opens below', () => {
    expect(
      getMultipleRecordPickerLayoutDirection({ side: 'bottom', align: 'end' }),
    ).toBe('search-bar-on-top');
  });

  it('places the search at the bottom when the popup opens above', () => {
    expect(
      getMultipleRecordPickerLayoutDirection({ side: 'top', align: 'start' }),
    ).toBe('search-bar-on-bottom');
  });

  it.each(['left', 'right'] as const)(
    'follows the alignment of a popup opened on the %s',
    (side) => {
      expect(
        getMultipleRecordPickerLayoutDirection({ side, align: 'start' }),
      ).toBe('search-bar-on-top');
      expect(
        getMultipleRecordPickerLayoutDirection({ side, align: 'center' }),
      ).toBe('search-bar-on-top');
      expect(
        getMultipleRecordPickerLayoutDirection({ side, align: 'end' }),
      ).toBe('search-bar-on-bottom');
    },
  );
});
