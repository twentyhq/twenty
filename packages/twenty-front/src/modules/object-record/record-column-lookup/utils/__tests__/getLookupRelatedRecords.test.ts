import { getLookupRelatedRecords } from '@/object-record/record-column-lookup/utils/getLookupRelatedRecords';

describe('getLookupRelatedRecords', () => {
  it('returns the related records of lookup columns only', () => {
    expect(
      getLookupRelatedRecords({
        records: [
          {
            id: 'person-1',
            __typename: 'Person',
            company: { id: 'company-1', __typename: 'Company', city: 'Paris' },
            owner: { id: 'member-1', __typename: 'WorkspaceMember' },
          },
          { id: 'person-2', __typename: 'Person', company: null },
        ],
        lookupRelationFieldNames: ['company'],
      }),
    ).toEqual([{ id: 'company-1', __typename: 'Company', city: 'Paris' }]);
  });
});
