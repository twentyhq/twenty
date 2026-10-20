import { splitFullNameInputText } from '@/ui/field/input/utils/splitFullNameInputText';

describe('splitFullNameInputText', () => {
  it('makes the first word the first name and the rest the last name', () => {
    expect(
      splitFullNameInputText('Jean de la Fontaine', {
        firstName: '',
        lastName: '',
      }),
    ).toEqual({
      firstName: 'Jean',
      lastName: 'de la Fontaine',
    });
  });

  it('keeps a single word as the first name', () => {
    expect(
      splitFullNameInputText('  Mary  ', { firstName: '', lastName: '' }),
    ).toEqual({
      firstName: 'Mary',
      lastName: '',
    });
  });

  it('keeps a single word in the last name when only the last name was set', () => {
    expect(
      splitFullNameInputText('Smith', { firstName: '', lastName: 'Smth' }),
    ).toEqual({
      firstName: '',
      lastName: 'Smith',
    });
  });

  it('returns empty names for blank text', () => {
    expect(
      splitFullNameInputText('   ', { firstName: 'Mary', lastName: '' }),
    ).toEqual({
      firstName: '',
      lastName: '',
    });
  });

  it('keeps a compound first name while the text still starts with it', () => {
    expect(
      splitFullNameInputText('Mary Ann Smyth', {
        firstName: 'Mary Ann',
        lastName: 'Smith',
      }),
    ).toEqual({
      firstName: 'Mary Ann',
      lastName: 'Smyth',
    });
  });

  it('splits again once the compound first name is edited', () => {
    expect(
      splitFullNameInputText('Marie Ann Smith', {
        firstName: 'Mary Ann',
        lastName: 'Smith',
      }),
    ).toEqual({
      firstName: 'Marie',
      lastName: 'Ann Smith',
    });
  });
});
