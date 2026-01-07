import { type ApolloCache } from '@apollo/client';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';

import { triggerUpdateGroupByQueriesOptimisticEffect } from '@/apollo/optimistic-effect/group-by/utils/triggerUpdateGroupByQueriesOptimisticEffect';

describe('triggerUpdateGroupByQueriesOptimisticEffect', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    nameSingular: 'person',
    namePlural: 'people',
  } as ObjectMetadataItem;

  const mockRecord: RecordGqlNode = {
    __typename: 'Person',
    id: '123',
    name: 'John',
  };

  it('should call cache.modify with correct field name', () => {
    const mockModify = jest.fn();
    const mockCache = {
      modify: mockModify,
    } as unknown as ApolloCache<unknown>;

    triggerUpdateGroupByQueriesOptimisticEffect({
      cache: mockCache,
      objectMetadataItem: mockObjectMetadataItem,
      operation: 'create',
      records: [mockRecord],
      shouldMatchRootQueryFilter: false,
    });

    expect(mockModify).toHaveBeenCalledWith({
      broadcast: false,
      fields: expect.objectContaining({
        peopleGroupBy: expect.any(Function),
      }),
    });
  });

  it('should handle update operation', () => {
    const mockModify = jest.fn();
    const mockCache = {
      modify: mockModify,
    } as unknown as ApolloCache<unknown>;

    triggerUpdateGroupByQueriesOptimisticEffect({
      cache: mockCache,
      objectMetadataItem: mockObjectMetadataItem,
      operation: 'update',
      records: [mockRecord],
      shouldMatchRootQueryFilter: false,
    });

    expect(mockModify).toHaveBeenCalled();
  });

  it('should handle delete operation', () => {
    const mockModify = jest.fn();
    const mockCache = {
      modify: mockModify,
    } as unknown as ApolloCache<unknown>;

    triggerUpdateGroupByQueriesOptimisticEffect({
      cache: mockCache,
      objectMetadataItem: mockObjectMetadataItem,
      operation: 'delete',
      records: [mockRecord],
      shouldMatchRootQueryFilter: false,
    });

    expect(mockModify).toHaveBeenCalled();
  });

  it('should handle empty records array', () => {
    const mockModify = jest.fn();
    const mockCache = {
      modify: mockModify,
    } as unknown as ApolloCache<unknown>;

    triggerUpdateGroupByQueriesOptimisticEffect({
      cache: mockCache,
      objectMetadataItem: mockObjectMetadataItem,
      operation: 'create',
      records: [],
      shouldMatchRootQueryFilter: false,
    });

    expect(mockModify).toHaveBeenCalled();
  });
});
