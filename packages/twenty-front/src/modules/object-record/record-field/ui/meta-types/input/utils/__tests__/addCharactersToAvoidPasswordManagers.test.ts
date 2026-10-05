import { addCharactersToAvoidPasswordManagers } from '@/object-record/record-field/ui/meta-types/input/utils/addCharactersToAvoidPasswordManagers';

describe('addCharactersToAvoidPasswordManagers', () => {
  it('should insert zero-width non-joiners after the first character', () => {
    expect(addCharactersToAvoidPasswordManagers('First name')).toBe(
      'F\u200C\u200Cirst name',
    );
  });

  it('should keep the visible text unchanged', () => {
    expect(
      addCharactersToAvoidPasswordManagers('Last name').replace(/\u200C/g, ''),
    ).toBe('Last name');
  });

  it('should handle an empty placeholder', () => {
    expect(addCharactersToAvoidPasswordManagers('')).toBe('\u200C\u200C');
  });
});
