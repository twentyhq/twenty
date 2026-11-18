import { filterSelectableFieldOptions } from '@/object-record/record-field/ui/utils/filterSelectableFieldOptions';

const OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'MEETING', label: 'Meeting', isActive: false },
  { value: 'PAUSED', label: 'Paused', isActive: false },
];

describe('filterSelectableFieldOptions', () => {
  it('should drop inactive options', () => {
    expect(
      filterSelectableFieldOptions({ options: OPTIONS, selectedValues: [] }),
    ).toEqual([{ value: 'OPEN', label: 'Open' }]);
  });

  it('should keep an inactive option that is already selected', () => {
    expect(
      filterSelectableFieldOptions({
        options: OPTIONS,
        selectedValues: ['PAUSED'],
      }).map(({ value }) => value),
    ).toEqual(['OPEN', 'PAUSED']);
  });
});
