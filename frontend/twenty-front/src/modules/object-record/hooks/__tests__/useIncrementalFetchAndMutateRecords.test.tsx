import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { renderHook } from '@testing-library/react';

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
    expect(mutateBatchMock).toHaveBeenCalledTimes(2);

    expect(mutateBatchMock).toHaveBeenNthCalledWith(1, {
      recordIds: ['1', '2'],
      totalFetchedCount: 2,
      totalCount: 3,
      abortSignal: expect.any(Object),
    });

    expect(mockFetchMoreRecordsLazy).toHaveBeenCalledWith(2);

    expect(mutateBatchMock).toHaveBeenNthCalledWith(2, {
      recordIds: ['3'],
      totalFetchedCount: 3,
      totalCount: 3,
      abortSignal: expect.any(Object),
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

    expect(result.current.isProcessing).toBe(false);

    await result.current.incrementalFetchAndMutate(jest.fn());

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

    jest.spyOn(global, 'AbortController').mockImplementation(
      () =>
        ({
          signal: { aborted: true } as unknown as AbortSignal,
          abort: abortMock,
        }) as unknown as AbortController,
    );

    await result.current.incrementalFetchAndMutate(jest.fn());

    expect(mockFetchMoreRecordsLazy).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it('should call abort on current controller when cancel is invoked', () => {
    const { result } = renderHook(() =>
      useIncrementalFetchAndMutateRecords({ objectNameSingular: 'c' } as any),
    );

    result.current.cancel();
  });

  it('should silently return when AbortError is thrown during fetch', async () => {
    const error: any = new Error('Aborted');
    error.name = 'AbortError';
    mockFindManyRecordsLazy.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useIncrementalFetchAndMutateRecords({
        objectNameSingular: 'company',
      } as any),
    );

    await expect(
      result.current.incrementalFetchAndMutate(jest.fn()),
    ).resolves.toBeUndefined();
  });

  it('should rethrow non-AbortError errors', async () => {
    mockFindManyRecordsLazy.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useIncrementalFetchAndMutateRecords({
        objectNameSingular: 'company',
      } as any),
    );

    await expect(
      result.current.incrementalFetchAndMutate(jest.fn()),
    ).rejects.toThrow('Network error');
  });
});
