import { type Reference } from '@apollo/client';

import { encodeCursor } from '@/apollo/utils/encodeCursor';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type FieldFunctionOptions } from '@apollo/client/cache';

type ToReferenceFunction = FieldFunctionOptions['toReference'];

import { createCacheEdgeWithRecordRef } from '@/object-record/cache/utils/createCacheEdgeWithRecordRef';

describe('createCacheEdgeWithRecordRef', () => {
  it('should create an edge with reference when toReference returns a reference', () => {
    const record: RecordGqlNode = {
      __typename: 'Person',
      id: '123',
    };

    const objectMetadataItem = {
      nameSingular: 'person',
    } as EnrichedObjectMetadataItem;

    const mockReference: Reference = {
      __ref: 'Person:123',
    };

    const toReference: ToReferenceFunction = jest.fn(() => mockReference);

    const result = createCacheEdgeWithRecordRef({
      record,
      objectMetadataItem,
      toReference,
    });

    expect(result).not.toBeNull();
    expect(result).toEqual({
      __typename: 'PersonEdge',
      node: mockReference,
      cursor: encodeCursor(record),
    });
    expect(toReference).toHaveBeenCalledWith(record);
  });

  it('should return null when toReference returns undefined', () => {
    const record: RecordGqlNode = {
      __typename: 'Person',
      id: '123',
    };

    const objectMetadataItem = {
      nameSingular: 'person',
    } as EnrichedObjectMetadataItem;

    const toReference: ToReferenceFunction = jest.fn(() => undefined);

    const result = createCacheEdgeWithRecordRef({
      record,
      objectMetadataItem,
      toReference,
    });

    expect(result).toBeNull();
    expect(toReference).toHaveBeenCalledWith(record);
  });
});
