import { splitFullNameInputText } from '@/ui/field/input/utils/splitFullNameInputText';

describe('splitFullNameInputText', () => {
  it('makes the first word the first name and the rest the last name', () => {
    expect(splitFullNameInputText('Jean de la Fontaine', '')).toEqual({
      firstName: 'Jean',
      lastName: 'de la Fontaine',
    });
  });

  it('keeps a single word as the first name', () => {
    expect(splitFullNameInputText('  Mary  ', '')).toEqual({
      firstName: 'Mary',
      lastName: '',
    });
  });

  it('returns empty names for blank text', () => {
    expect(splitFullNameInputText('   ', 'Mary')).toEqual({
      firstName: '',
      lastName: '',
    });
  });

  it('keeps a compound first name while the text still starts with it', () => {
    expect(splitFullNameInputText('Mary Ann Smyth', 'Mary Ann')).toEqual({
      firstName: 'Mary Ann',
      lastName: 'Smyth',
    });
  });

  it('splits again once the compound first name is edited', () => {
    expect(splitFullNameInputText('Marie Ann Smith', 'Mary Ann')).toEqual({
      firstName: 'Marie',
      lastName: 'Ann Smith',
    });
  });
});
