import { isSelectOptionNameTaken } from '@/object-record/record-field/ui/utils/isSelectOptionNameTaken';

const OPTIONS = [
  { label: 'Open', value: 'OPEN' },
  { label: 'Client meeting', value: 'MEETING' },
];

describe('isSelectOptionNameTaken', () => {
  it('should match an option by label case-insensitively', () => {
    expect(
      isSelectOptionNameTaken({
        options: OPTIONS,
        optionName: 'client MEETING',
      }),
    ).toBe(true);
  });

  it('should match an option by the value the name would get', () => {
    expect(
      isSelectOptionNameTaken({ options: OPTIONS, optionName: 'meeting' }),
    ).toBe(true);
  });

  it('should not match a new name', () => {
    expect(
      isSelectOptionNameTaken({ options: OPTIONS, optionName: 'Closed' }),
    ).toBe(false);
  });
});
