import { getSelectedRelationRecords } from '@/object-record/record-store/utils/getSelectedRelationRecords';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const company = { id: 'company-1', __typename: 'Company', city: 'Paris' };

describe('getSelectedRelationRecords', () => {
  it('returns the records nested under selected many-to-one relations', () => {
    expect(
      getSelectedRelationRecords({
        record: {
          id: 'person-1',
          __typename: 'Person',
          company,
          name: { firstName: 'Ada', lastName: 'Lovelace' },
          noteTargets: { edges: [] },
        },
        objectMetadataItems,
      }),
    ).toEqual([company]);
  });

  it('skips empty relations and relations outside the selection', () => {
    expect(
      getSelectedRelationRecords({
        record: { id: 'person-1', __typename: 'Person', company },
        recordGqlFields: { id: true },
        objectMetadataItems,
      }),
    ).toEqual([]);

    expect(
      getSelectedRelationRecords({
        record: { id: 'person-2', __typename: 'Person', company: null },
        objectMetadataItems,
      }),
    ).toEqual([]);
  });
});
