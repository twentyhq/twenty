import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';

const peopleMock = [...mockedPersonRecords];

describe('getRecordNodeFromRecord', () => {
  it('computes relation records cache references by default', () => {
    // Given
    const objectMetadataItems: EnrichedObjectMetadataItem[] =
      getTestEnrichedObjectMetadataItemsMock();
    const objectMetadataItem:
      | Pick<
          EnrichedObjectMetadataItem,
          'fields' | 'namePlural' | 'nameSingular'
        >
      | undefined = getTestEnrichedObjectMetadataItemsMock().find(
      (item) => item.nameSingular === 'person',
    );

    if (!objectMetadataItem) {
      throw new Error('Object metadata item not found');
    }

    const recordGqlFields = {
      name: true,
      company: true,
    };
    const record = peopleMock[0];

    // When
    const result = getRecordNodeFromRecord({
      objectMetadataItems,
      objectMetadataItem,
      recordGqlFields,
      record,
    });

    // Then
    expect(result).toEqual({
      __typename: 'Person',
      company: {
        __ref: `Company:${record.company.id}`,
      },
      name: {
        __typename: 'FullName',
        firstName: record.name.firstName,
        lastName: record.name.lastName,
      },
    });
  });

  it('does not compute relation records cache references when `computeReferences` is false', () => {
    // Given
    const objectMetadataItems: EnrichedObjectMetadataItem[] =
      getTestEnrichedObjectMetadataItemsMock();
    const objectMetadataItem:
      | Pick<
          EnrichedObjectMetadataItem,
          'fields' | 'namePlural' | 'nameSingular'
        >
      | undefined = getTestEnrichedObjectMetadataItemsMock().find(
      (item) => item.nameSingular === 'person',
    );

    if (!objectMetadataItem) {
      throw new Error('Object metadata item not found');
    }

    const recordGqlFields = {
      name: true,
      company: true,
    };
    const record = peopleMock[0];
    const computeReferences = false;

    // When
    const result = getRecordNodeFromRecord({
      objectMetadataItems,
      objectMetadataItem,
      recordGqlFields,
      record,
      computeReferences,
    });

    // Then
    expect(result).toEqual({
      __typename: 'Person',
      company: record.company,
      name: {
        __typename: 'FullName',
        firstName: record.name.firstName,
        lastName: record.name.lastName,
      },
    });
  });
});
