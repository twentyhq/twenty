import { getRecordsWithLookupRelatedRecords } from '@/object-record/record-column-lookup/utils/getRecordsWithLookupRelatedRecords';

const company = { id: 'company-1', __typename: 'Company', city: 'Paris' };

describe('getRecordsWithLookupRelatedRecords', () => {
  it('adds each related record of a lookup relation once after the records', () => {
    const firstPerson = { id: 'person-1', __typename: 'Person', company };
    const secondPerson = { id: 'person-2', __typename: 'Person', company };

    expect(
      getRecordsWithLookupRelatedRecords({
        records: [firstPerson, secondPerson],
        lookupRelationFieldNames: ['company'],
      }),
    ).toEqual([firstPerson, secondPerson, company]);
  });

  it('merges the fields of one record reached through two lookup relations', () => {
    const person = {
      id: 'person-1',
      __typename: 'Person',
      company,
      previousCompany: { id: 'company-1', __typename: 'Company', name: 'Acme' },
    };

    expect(
      getRecordsWithLookupRelatedRecords({
        records: [person],
        lookupRelationFieldNames: ['company', 'previousCompany'],
      }),
    ).toEqual([
      person,
      { id: 'company-1', __typename: 'Company', city: 'Paris', name: 'Acme' },
    ]);
  });

  it('keeps a JSON value shaped like a record inside its field', () => {
    const id = '157442bf-a45b-4d37-b615-71be03a45752';
    const companyWithSnapshot = {
      id,
      __typename: 'Company',
      name: 'Current name',
      snapshot: { id, __typename: 'Company', name: 'Old name' },
    };

    expect(
      getRecordsWithLookupRelatedRecords({
        records: [companyWithSnapshot],
        lookupRelationFieldNames: [],
      }),
    ).toEqual([companyWithSnapshot]);
  });

  it('skips empty lookup relations', () => {
    const person = { id: 'person-1', __typename: 'Person', company: null };

    expect(
      getRecordsWithLookupRelatedRecords({
        records: [person],
        lookupRelationFieldNames: ['company'],
      }),
    ).toEqual([person]);
  });
});
