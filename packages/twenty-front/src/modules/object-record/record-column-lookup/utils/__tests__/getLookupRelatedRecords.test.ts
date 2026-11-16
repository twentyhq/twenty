import { getLookupRelatedRecords } from '@/object-record/record-column-lookup/utils/getLookupRelatedRecords';

const companyLookupTarget = { relationFieldName: 'company' };

const company = { id: 'company-1', __typename: 'Company', city: 'Paris' };

describe('getLookupRelatedRecords', () => {
  it('returns the records related through a lookup column relation', () => {
    expect(
      getLookupRelatedRecords({
        records: [
          {
            id: 'person-1',
            __typename: 'Person',
            company,
            assignee: { id: 'member-1', __typename: 'WorkspaceMember' },
          },
          { id: 'person-2', __typename: 'Person', company: null },
        ],
        columnDescriptorByRecordFieldId: {
          'lookup-column': { lookupTarget: companyLookupTarget },
          'plain-column': { lookupTarget: undefined },
        },
      }),
    ).toEqual([company]);
  });

  it('returns each related record once across rows and lookup columns of one relation', () => {
    expect(
      getLookupRelatedRecords({
        records: [
          { id: 'person-1', __typename: 'Person', company },
          { id: 'person-2', __typename: 'Person', company },
        ],
        columnDescriptorByRecordFieldId: {
          'city-column': { lookupTarget: companyLookupTarget },
          'name-column': { lookupTarget: companyLookupTarget },
        },
      }),
    ).toEqual([company]);
  });

  it('merges the fields of one record reached through two relations', () => {
    expect(
      getLookupRelatedRecords({
        records: [
          {
            id: 'person-1',
            __typename: 'Person',
            company: { id: 'company-1', __typename: 'Company', city: 'Paris' },
            previousCompany: {
              id: 'company-1',
              __typename: 'Company',
              name: 'Acme',
            },
          },
        ],
        columnDescriptorByRecordFieldId: {
          'city-column': { lookupTarget: companyLookupTarget },
          'name-column': {
            lookupTarget: { relationFieldName: 'previousCompany' },
          },
        },
      }),
    ).toEqual([
      { id: 'company-1', __typename: 'Company', city: 'Paris', name: 'Acme' },
    ]);
  });

  it('returns nothing without lookup columns', () => {
    expect(
      getLookupRelatedRecords({
        records: [{ id: 'person-1', __typename: 'Person', company }],
        columnDescriptorByRecordFieldId: {
          'plain-column': { lookupTarget: undefined },
        },
      }),
    ).toEqual([]);
  });
});
