import { getRecordShortLabel } from '@/companies/utils/getRecordShortLabel';

describe('getRecordShortLabel', () => {
  it('returns the trimmed short name of a company', () => {
    expect(
      getRecordShortLabel({
        objectNameSingular: 'company',
        record: {
          __typename: 'Company',
          id: '1',
          name: 'Airbnb, Inc.',
          shortName: ' Airbnb ',
        },
      }),
    ).toBe('Airbnb');
  });

  it('returns undefined when the company has no short name', () => {
    expect(
      getRecordShortLabel({
        objectNameSingular: 'company',
        record: {
          __typename: 'Company',
          id: '1',
          name: 'Airbnb, Inc.',
          shortName: '  ',
        },
      }),
    ).toBeUndefined();
  });

  it('ignores other objects', () => {
    expect(
      getRecordShortLabel({
        objectNameSingular: 'person',
        record: { __typename: 'Person', id: '1', shortName: 'Jo' },
      }),
    ).toBeUndefined();
  });
});
