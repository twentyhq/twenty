import { useCreateOneRecordInCache } from '@/object-record/cache/hooks/useCreateOneRecordInCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { InMemoryCache } from '@apollo/client';
import { act, renderHook } from '@testing-library/react';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('useCreateOneRecordInCache', () => {
  it('creates records for different object types with one hook instance', () => {
    const cache = new InMemoryCache();
    const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
    const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
    const companyObjectMetadataItem =
      getMockObjectMetadataItemOrThrow('company');

    const { result } = renderHook(
      () => useCreateOneRecordInCache<ObjectRecord>(),
      {
        wrapper: getJestMetadataAndApolloMocksWrapper({
          cache,
          objectMetadataItems,
        }),
      },
    );

    const personRecordId = '20202020-1111-4111-8111-111111111111';
    const companyRecordId = '20202020-2222-4222-8222-222222222222';
    const personTypename = getObjectTypename(
      personObjectMetadataItem.nameSingular,
    );
    const companyTypename = getObjectTypename(
      companyObjectMetadataItem.nameSingular,
    );
    let createdPersonRecord: ObjectRecord | undefined;
    let createdCompanyRecord: ObjectRecord | undefined;

    act(() => {
      createdPersonRecord = result.current({
        objectMetadataItem: personObjectMetadataItem,
        record: {
          id: personRecordId,
          __typename: personTypename,
        },
      });
      createdCompanyRecord = result.current({
        objectMetadataItem: companyObjectMetadataItem,
        record: {
          id: companyRecordId,
          name: 'Twenty',
          __typename: companyTypename,
        },
      });
    });

    expect(createdPersonRecord).toMatchObject({ id: personRecordId });
    expect(createdCompanyRecord).toMatchObject({
      id: companyRecordId,
      name: 'Twenty',
    });
    expect(cache.extract()).toMatchObject({
      [`${personTypename}:${personRecordId}`]: { id: personRecordId },
      [`${companyTypename}:${companyRecordId}`]: {
        id: companyRecordId,
        name: 'Twenty',
      },
    });
  });
});
