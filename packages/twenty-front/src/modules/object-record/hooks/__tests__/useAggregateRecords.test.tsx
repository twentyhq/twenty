import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import {
    AGGREGATE_QUERY,
    mockResponse,
} from '@/object-record/hooks/__mocks__/useAggregateRecords';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { useAggregateRecordsQuery } from '@/object-record/hooks/useAggregateRecordsQuery';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useQuery } from '@apollo/client';
import { renderHook } from '@testing-library/react';

// Mocks
jest.mock('@apollo/client');
jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-record/hooks/useAggregateRecordsQuery');

const mockObjectMetadataItem = {
  nameSingular: 'opportunity',
  namePlural: 'opportunities',
};

const mockGqlFieldToFieldMap = {
  sumAmount: ['amount', AggregateOperations.sum],
  avgAmount: ['amount', AggregateOperations.avg],
  totalCount: ['name', AggregateOperations.count],
};

describe('useAggregateRecords', () => {
  beforeEach(() => {
    (useObjectMetadataItem as jest.Mock).mockReturnValue({
      objectMetadataItem: mockObjectMetadataItem,
    });

    (useAggregateRecordsQuery as jest.Mock).mockReturnValue({
      aggregateQuery: AGGREGATE_QUERY,
      gqlFieldToFieldMap: mockGqlFieldToFieldMap,
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: mockResponse,
      loading: false,
      error: undefined,
    });
  });

  it('should format data correctly', () => {
    const { result } = renderHook(() =>
      useAggregateRecords({
        objectNameSingular: 'opportunity',
        recordGqlFieldsAggregate: {
          amount: [AggregateOperations.sum, AggregateOperations.avg],
          name: [AggregateOperations.count],
        },
      }),
    );

    expect(result.current.data).toEqual({
      amount: {
        [AggregateOperations.sum]: 1000000,
        [AggregateOperations.avg]: 23800,
      },
      name: {
        [AggregateOperations.count]: 42,
      },
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle loading state', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
    });

    const { result } = renderHook(() =>
      useAggregateRecords({
        objectNameSingular: 'opportunity',
        recordGqlFieldsAggregate: {
          amount: [AggregateOperations.sum],
        },
      }),
    );

    expect(result.current.data).toEqual({});
    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', () => {
    const mockError = new Error('Query failed');
    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      loading: false,
      error: mockError,
    });

    const { result } = renderHook(() =>
      useAggregateRecords({
        objectNameSingular: 'opportunity',
        recordGqlFieldsAggregate: {
          amount: [AggregateOperations.sum],
        },
      }),
    );

    expect(result.current.data).toEqual({});
    expect(result.current.error).toBe(mockError);
  });

  it('should skip query when specified', () => {
    renderHook(() =>
      useAggregateRecords({
        objectNameSingular: 'opportunity',
        recordGqlFieldsAggregate: {
          amount: [AggregateOperations.sum],
        },
        skip: true,
      }),
    );

    expect(useQuery).toHaveBeenCalledWith(
      AGGREGATE_QUERY,
      expect.objectContaining({
        skip: true,
      }),
    );
  });
});
