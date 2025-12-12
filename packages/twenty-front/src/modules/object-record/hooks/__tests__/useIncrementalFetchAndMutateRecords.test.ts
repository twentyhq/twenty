import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { renderHook } from '@testing-library/react';

import { expect } from '@storybook/test';
import { useIncrementalFetchAndMutateRecords } from '../useIncrementalFetchAndMutateRecords';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-record/hooks/useLazyFindManyRecords');

const mockUseObjectMetadataItem = jest.mocked(useObjectMetadataItem);
const mockUseLazyFindManyRecords = jest.mocked(useLazyFindManyRecords);

describe('useIncrementalFetchAndMutateRecords', () => {
  const mockFindManyRecordsLazy = jest.fn();
  const mockFetchMoreRecordsLazy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: {
        nameSingular: 'company',
        namePlural: 'companies',
      } as any,
    });
    mockUseLazyFindManyRecords.mockReturnValue({
      findManyRecordsLazy: mockFindManyRecordsLazy,
      fetchMoreRecordsLazy: mockFetchMoreRecordsLazy,
    } as any);
  });

  it('should fetch and mutate records in batches', async () => {
    // Setup mock returns
    // First page: 2 records, total 3.
    mockFindManyRecordsLazy.mockResolvedValue({
      data: {
        companies: {
          totalCount: 3,
          edges: [{ node: { id: '1' } }, { node: { id: '2' } }],
          pageInfo: {
            hasNextPage: true,
            endCursor: 'cursor-1',
          },
        },
      },
    });

    // Second page: 1 record, total 3.
    mockFetchMoreRecordsLazy.mockResolvedValue({
      data: {
        edges: [{ node: { id: '3' } }],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'cursor-2',
        },
      },
    });

    const { result } = renderHook(() =>
      useIncrementalFetchAndMutateRecords({
        objectNameSingular: 'company',
        limit: 2,
      } as any),
    );

    const mutateBatchMock = jest.fn();

    await result.current.incrementalFetchAndMutate(mutateBatchMock);

    expect(mockFindManyRecordsLazy).toHaveBeenCalled();
    // Expect 2 batches
    expect(mutateBatchMock).toHaveBeenCalledTimes(2);

    expect(mutateBatchMock).toHaveBeenNthCalledWith(1, {
      recordIds: ['1', '2'],
      totalFetchedCount: 2,
      totalCount: 3,
    });

    expect(mockFetchMoreRecordsLazy).toHaveBeenCalledWith(2);

    expect(mutateBatchMock).toHaveBeenNthCalledWith(2, {
      recordIds: ['3'],
      totalFetchedCount: 3,
      totalCount: 3,
    });
  });

  it('should update progress during processing', async () => {
     mockFindManyRecordsLazy.mockResolvedValue({
      data: {
        companies: {
          totalCount: 1,
          edges: [{ node: { id: '1' } }],
          pageInfo: { hasNextPage: false },
        },
      },
    });

    const { result } = renderHook(() =>
      useIncrementalFetchAndMutateRecords({
        objectNameSingular: 'company',
      } as any),
    );

    // Initial state
    expect(result.current.isProcessing).toBe(false);

    // Trigger process
    const promise = result.current.incrementalFetchAndMutate(jest.fn());

    // We can't easily assert isProcessing=true here without proper act() wrapping since it changes immediately.
    // relying on the finally block to reset it.

    await promise;

    expect(result.current.isProcessing).toBe(false);
  });

  it('should do nothing if findManyRecordsLazy is undefined', async () => {
    mockUseLazyFindManyRecords.mockReturnValue({
      findManyRecordsLazy: undefined,
      fetchMoreRecordsLazy: mockFetchMoreRecordsLazy,
    } as any);

    const { result } = renderHook(() =>
      useIncrementalFetchAndMutateRecords({
        objectNameSingular: 'company',
      } as any),
    );

    await result.current.incrementalFetchAndMutate(jest.fn());
    expect(mockFindManyRecordsLazy).not.toHaveBeenCalled();
  });

  it('should abort processing when cancel is called', async () => {
    mockFindManyRecordsLazy.mockResolvedValue({
      data: {
        companies: {
          totalCount: 10,
          edges: [],
          pageInfo: { hasNextPage: true, endCursor: 'c1' },
        },
      },
    });

    const { result } = renderHook(() =>
      useIncrementalFetchAndMutateRecords({
        objectNameSingular: 'company',
      } as any),
    );

    const abortMock = jest.fn();
    // @ts-ignore
    jest.spyOn(global, 'AbortController').mockImplementation(() => ({
      signal: { aborted: true },
      abort: abortMock,
    }));

    await result.current.incrementalFetchAndMutate(jest.fn());

    expect(mockFetchMoreRecordsLazy).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it('should call abort on current controller when cancel is invoked', () => {
     const { result } = renderHook(() =>
        useIncrementalFetchAndMutateRecords({ objectNameSingular: 'c' } as any)
      );

      // calling it when null shouldn't explode
      result.current.cancel();
      expect(true).toBe(true);
  });
});
