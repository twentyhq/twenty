import { type Reference } from '@apollo/client';

import { encodeCursor } from '@/apollo/utils/encodeCursor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type ToReferenceFunction } from '@apollo/client/cache/core/types/common';

import { createCacheEdgeWithRecordRef } from '@/object-record/cache/utils/createCacheEdgeWithRecordRef';

describe('createCacheEdgeWithRecordRef', () => {
  it('should create an edge with reference when toReference returns a reference', () => {
    // Given
    const record: RecordGqlNode = {
      __typename: 'Person',
      id: '123',
    };

    const objectMetadataItem = {
      nameSingular: 'person',
    } as ObjectMetadataItem;

    const mockReference: Reference = {
      __ref: 'Person:123',
    };

    const toReference: ToReferenceFunction = jest.fn(() => mockReference);

    // When
    const result = createCacheEdgeWithRecordRef({
      record,
      objectMetadataItem,
      toReference,
    });

    // Then
    expect(result).not.toBeNull();
    expect(result).toEqual({
      __typename: 'PersonEdge',
      node: mockReference,
      cursor: encodeCursor(record),
    });
    expect(toReference).toHaveBeenCalledWith(record);
  });

  it('should return null when toReference returns undefined', () => {
    // Given
    const record: RecordGqlNode = {
      __typename: 'Person',
      id: '123',
    };

    const objectMetadataItem = {
      nameSingular: 'person',
    } as ObjectMetadataItem;

    const toReference: ToReferenceFunction = jest.fn(() => undefined);

    // When
    const result = createCacheEdgeWithRecordRef({
      record,
      objectMetadataItem,
      toReference,
    });

    // Then
    expect(result).toBeNull();
    expect(toReference).toHaveBeenCalledWith(record);
  });
});
