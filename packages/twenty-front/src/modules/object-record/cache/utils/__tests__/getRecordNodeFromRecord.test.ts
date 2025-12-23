import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { getPeopleRecordConnectionMock } from '~/testing/mock-data/people';

import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';

const peopleMock = getPeopleRecordConnectionMock();

describe('getRecordNodeFromRecord', () => {
  it('computes relation records cache references by default', () => {
    // Given
    const objectMetadataItems: ObjectMetadataItem[] =
      generatedMockObjectMetadataItems;
    const objectMetadataItem:
      | Pick<ObjectMetadataItem, 'fields' | 'namePlural' | 'nameSingular'>
      | undefined = generatedMockObjectMetadataItems.find(
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
    const objectMetadataItems: ObjectMetadataItem[] =
      generatedMockObjectMetadataItems;
    const objectMetadataItem:
      | Pick<ObjectMetadataItem, 'fields' | 'namePlural' | 'nameSingular'>
      | undefined = generatedMockObjectMetadataItems.find(
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
