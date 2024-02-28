import { Field } from '@/spreadsheet-import/types';
import { findMatch } from '@/spreadsheet-import/utils/findMatch';

describe('findMatch', () => {
  const defaultField: Field<'defaultField'> = {
    key: 'defaultField',
    icon: null,
    label: 'label',
    fieldType: {
      type: 'input',
    },
    alternateMatches: ['Full Name', 'First Name'],
  };

  const secondaryField: Field<'secondaryField'> = {
    key: 'secondaryField',
    icon: null,
    label: 'label',
    fieldType: {
      type: 'input',
    },
  };

  const fields = [defaultField, secondaryField];

  it('should return the matching field if the header matches exactly with the key', () => {
    const autoMapDistance = 0;

    const result = findMatch(defaultField.key, fields, autoMapDistance);

    expect(result).toBe(defaultField.key);
  });

  it('should return the matching field if the header matches exactly one of the alternate matches', () => {
    const autoMapDistance = 0;

    const result = findMatch(
      defaultField.alternateMatches?.[0] ?? '',
      fields,
      autoMapDistance,
    );

    expect(result).toBe(defaultField.key);
  });

  it('should return the matching field if the header matches partially one of the alternate matches', () => {
    const header = 'First';
    const autoMapDistance = 5;

    const result = findMatch(header, fields, autoMapDistance);

    expect(result).toBe(defaultField.key);
  });

  it('should return the matching field if the header matches partially both of the alternate matches', () => {
    const header = 'Name';
    const autoMapDistance = 5;

    const result = findMatch(header, fields, autoMapDistance);

    expect(result).toBe(defaultField.key);
  });

  it('should return undefined if no exact match or alternate match is found within the auto map distance', () => {
    const header = 'Header';
    const autoMapDistance = 2;

    const result = findMatch(header, fields, autoMapDistance);

    expect(result).toBeUndefined();
  });

  it('should return the matching field with the smallest Levenshtein distance if within auto map distance', () => {
    const header = 'Name'.split('').reverse().join('');
    const autoMapDistance = 100;

    const result = findMatch(header, fields, autoMapDistance);

    expect(result).toBe(defaultField.key);
  });

  it('should return undefined if no match is found within auto map distance', () => {
    const header = 'Name'.split('').reverse().join('');
    const autoMapDistance = 1;

    const result = findMatch(header, fields, autoMapDistance);

    expect(result).toBeUndefined();
  });
});
