import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  mockedObjectMetadataItems,
  mockedPersonObjectMetadataItem,
} from '~/testing/mock-data/metadata';
import { mockedPeopleData } from '~/testing/mock-data/people';

import { getRecordNodeFromRecord } from '../getRecordNodeFromRecord';

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
    const record = mockedPeopleData[0];

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
        __ref: 'Company:5c21e19e-e049-4393-8c09-3e3f8fb09ecb',
      },
      name: {
        __typename: 'FullName',
        firstName: 'Alexandre',
        lastName: 'Prot',
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
    const record = mockedPeopleData[0];
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
        firstName: 'Alexandre',
        lastName: 'Prot',
      },
    });
  });
});
