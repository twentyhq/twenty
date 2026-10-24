import { splitFullNameInputText } from '@/object-record/record-field/ui/meta-types/input/utils/splitFullNameInputText';

const EMPTY_FULL_NAME = { firstName: '', lastName: '' };

describe('splitFullNameInputText', () => {
  it('makes the first word the first name and the rest the last name', () => {
    expect(
      splitFullNameInputText({
        text: 'Jean de la Fontaine',
        currentFullName: EMPTY_FULL_NAME,
      }),
    ).toEqual({ firstName: 'Jean', lastName: 'de la Fontaine' });
  });

  it('keeps a single word as the first name', () => {
    expect(
      splitFullNameInputText({
        text: '  Mary  ',
        currentFullName: EMPTY_FULL_NAME,
      }),
    ).toEqual({ firstName: 'Mary', lastName: '' });
  });

  it('keeps a single word in the last name when only the last name was set', () => {
    expect(
      splitFullNameInputText({
        text: 'Smith',
        currentFullName: { firstName: '', lastName: 'Smth' },
      }),
    ).toEqual({ firstName: '', lastName: 'Smith' });
  });

  it('returns empty names for blank text', () => {
    expect(
      splitFullNameInputText({
        text: '   ',
        currentFullName: { firstName: 'Mary', lastName: '' },
      }),
    ).toEqual(EMPTY_FULL_NAME);
  });

  it('keeps a compound first name while the text still starts with it', () => {
    expect(
      splitFullNameInputText({
        text: 'Mary Ann Smyth',
        currentFullName: { firstName: 'Mary Ann', lastName: 'Smith' },
      }),
    ).toEqual({ firstName: 'Mary Ann', lastName: 'Smyth' });
  });

  it('splits again once the compound first name is edited', () => {
    expect(
      splitFullNameInputText({
        text: 'Marie Ann Smith',
        currentFullName: { firstName: 'Mary Ann', lastName: 'Smith' },
      }),
    ).toEqual({ firstName: 'Marie', lastName: 'Ann Smith' });
  });
});
