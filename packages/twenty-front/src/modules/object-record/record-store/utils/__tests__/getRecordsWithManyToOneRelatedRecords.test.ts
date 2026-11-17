import { getRecordsWithManyToOneRelatedRecords } from '@/object-record/record-store/utils/getRecordsWithManyToOneRelatedRecords';

const company = { id: 'company-1', __typename: 'Company', city: 'Paris' };

describe('getRecordsWithManyToOneRelatedRecords', () => {
  it('adds each related record once after the records', () => {
    const firstPerson = { id: 'person-1', __typename: 'Person', company };
    const secondPerson = { id: 'person-2', __typename: 'Person', company };

    expect(
      getRecordsWithManyToOneRelatedRecords([firstPerson, secondPerson]),
    ).toEqual([firstPerson, secondPerson, company]);
  });

  it('merges the fields of one record reached through two relations', () => {
    const person = {
      id: 'person-1',
      __typename: 'Person',
      company,
      previousCompany: { id: 'company-1', __typename: 'Company', name: 'Acme' },
    };

    expect(getRecordsWithManyToOneRelatedRecords([person])).toEqual([
      person,
      { id: 'company-1', __typename: 'Company', city: 'Paris', name: 'Acme' },
    ]);
  });

  it('skips connections, composite values and empty relations', () => {
    const person = {
      id: 'person-1',
      __typename: 'Person',
      company: null,
      name: { firstName: 'Ada', lastName: 'Lovelace' },
      attachments: { __typename: 'AttachmentConnection', edges: [] },
    };

    expect(getRecordsWithManyToOneRelatedRecords([person])).toEqual([person]);
  });
});
