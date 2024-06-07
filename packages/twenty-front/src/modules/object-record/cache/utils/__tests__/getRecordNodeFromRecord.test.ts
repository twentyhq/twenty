import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  mockedObjectMetadataItems,
  mockedPersonObjectMetadataItem,
} from '~/testing/mock-data/metadata';
import { getPeopleMock } from '~/testing/mock-data/people';

import { getRecordNodeFromRecord } from '../getRecordNodeFromRecord';

const peopleMock = getPeopleMock();

describe('getRecordNodeFromRecord', () => {
  it('computes relation records cache references by default', () => {
    // Given
    const objectMetadataItems: ObjectMetadataItem[] = mockedObjectMetadataItems;
    const objectMetadataItem: Pick<
      ObjectMetadataItem,
      'fields' | 'namePlural' | 'nameSingular'
    > = mockedPersonObjectMetadataItem;
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
    const objectMetadataItems: ObjectMetadataItem[] = mockedObjectMetadataItems;
    const objectMetadataItem: Pick<
      ObjectMetadataItem,
      'fields' | 'namePlural' | 'nameSingular'
    > = mockedPersonObjectMetadataItem;
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
