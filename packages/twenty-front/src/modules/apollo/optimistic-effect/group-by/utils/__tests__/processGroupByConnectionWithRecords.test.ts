import { type Reference } from '@apollo/client';
import {
  type ReadFieldFunction,
  type ToReferenceFunction,
} from '@apollo/client/cache/core/types/common';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';

import { processGroupByConnectionWithRecords } from '@/apollo/optimistic-effect/group-by/utils/processGroupByConnectionWithRecords';

describe('processGroupByConnectionWithRecords', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    nameSingular: 'person',
    namePlural: 'people',
  } as ObjectMetadataItem;

  const mockRecord: RecordGqlNode = {
    __typename: 'Person',
    id: '123',
    name: 'John',
    deletedAt: null,
  };

  const mockReference: Reference = {
    __ref: 'Person:123',
  };

  const mockReadField = jest.fn(
    (fieldName: any, from: any, ..._args: any[]) => {
      if (fieldName === 'id' && from === mockReference) {
        return '123';
      }
      return undefined;
    },
  ) as unknown as ReadFieldFunction;

  const mockToReference: ToReferenceFunction = jest.fn(() => mockReference);

  it('should return cached data when no records match', () => {
    const cachedEdges: RecordGqlRefEdge[] = [];
    const cachedPageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
    };

    const result = processGroupByConnectionWithRecords({
      cachedEdges,
      cachedPageInfo,
      records: [],
      operation: 'create',
      queryFilter: {},
      shouldMatchRootQueryFilter: false,
      groupByDimensionValues: [],
      groupByConfig: undefined,
      objectMetadataItem: mockObjectMetadataItem,
      readField: mockReadField,
      toReference: mockToReference,
    });

    expect(result.nextEdges).toEqual([]);
    expect(result.totalCountDelta).toBe(0);
  });

  it('should handle create operation', () => {
    const cachedEdges: RecordGqlRefEdge[] = [];
    const cachedPageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
    };

    const result = processGroupByConnectionWithRecords({
      cachedEdges,
      cachedPageInfo,
      records: [mockRecord],
      operation: 'create',
      queryFilter: {},
      shouldMatchRootQueryFilter: false,
      groupByDimensionValues: [],
      groupByConfig: undefined,
      objectMetadataItem: mockObjectMetadataItem,
      readField: mockReadField,
      toReference: mockToReference,
    });

    expect(result.totalCountDelta).toBe(1);
    expect(result.nextEdges.length).toBe(1);
  });

  it('should handle delete operation', () => {
    const mockEdge: RecordGqlRefEdge = {
      __typename: 'PersonEdge',
      node: mockReference,
      cursor: 'cursor123',
    };

    const cachedEdges: RecordGqlRefEdge[] = [mockEdge];
    const cachedPageInfo = {
      hasNextPage: false,
      hasPreviousPage: false,
    };

    const result = processGroupByConnectionWithRecords({
      cachedEdges,
      cachedPageInfo,
      records: [mockRecord],
      operation: 'delete',
      queryFilter: {},
      shouldMatchRootQueryFilter: false,
      groupByDimensionValues: [],
      groupByConfig: undefined,
      objectMetadataItem: mockObjectMetadataItem,
      readField: mockReadField,
      toReference: mockToReference,
    });

    expect(result.totalCountDelta).toBe(-1);
    expect(result.nextEdges.length).toBe(0);
  });
});
