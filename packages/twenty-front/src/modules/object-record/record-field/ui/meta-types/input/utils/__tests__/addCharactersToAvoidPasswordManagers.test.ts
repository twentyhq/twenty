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

  it('should keep an Arabic placeholder unchanged', () => {
    expect(addCharactersToAvoidPasswordManagers('الاسم الأول')).toBe('الاسم الأول');
  });

  it('should keep a Persian placeholder unchanged', () => {
    expect(addCharactersToAvoidPasswordManagers('نام خانوادگی')).toBe(
      'نام خانوادگی',
    );
  });

  it('should keep a placeholder written in Arabic presentation forms unchanged', () => {
    expect(addCharactersToAvoidPasswordManagers('\uFE8D\uFEDF\uFEE3')).toBe(
      '\uFE8D\uFEDF\uFEE3',
    );
  });

  it('should still insert the non-joiners in a script that does not join', () => {
    expect(addCharactersToAvoidPasswordManagers('Имя')).toBe('И\u200C\u200Cмя');
  });

  it('should handle an empty placeholder', () => {
    expect(addCharactersToAvoidPasswordManagers('')).toBe('\u200C\u200C');
  });
});
