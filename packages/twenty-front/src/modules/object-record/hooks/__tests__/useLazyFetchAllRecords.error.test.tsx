import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { act, renderHook, waitFor } from '@testing-library/react';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-record/hooks/useLazyFindManyRecords');

const mockUseObjectMetadataItem = jest.mocked(useObjectMetadataItem);
const mockUseLazyFindManyRecords = jest.mocked(useLazyFindManyRecords);

describe('useLazyFetchAllRecords error handling', () => {
  const mockFindManyRecordsLazy = jest.fn();
  const mockFetchMoreRecordsLazy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: {
        nameSingular: 'person',
        namePlural: 'people',
      } as any,
    });
    mockUseLazyFindManyRecords.mockReturnValue({
      findManyRecordsLazy: mockFindManyRecordsLazy,
      fetchMoreRecordsLazy: mockFetchMoreRecordsLazy,
      queryIdentifier: 'test-query',
    });
  });

  it('should reject when a subsequent page fetch fails', async () => {
    const fetchMoreError = new Error('Failed to fetch records');

    mockFindManyRecordsLazy.mockResolvedValue({
      data: {
        people: {
          edges: [{ node: { id: '1' }, cursor: '1' }],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: '1',
            endCursor: '1',
          },
          totalCount: 2,
        },
      },
      error: undefined,
    });

    mockFetchMoreRecordsLazy.mockResolvedValue({ error: fetchMoreError });

    const { result } = renderHook(() =>
      useLazyFetchAllRecords({
        objectNameSingular: 'person',
        limit: 1,
      }),
    );

    let fetchPromise: Promise<unknown>;

    act(() => {
      fetchPromise = result.current.fetchAllRecords();
    });

    await expect(fetchPromise!).rejects.toThrow('Failed to fetch records');

    await waitFor(() => {
      expect(result.current.isDownloading).toBe(false);
      expect(result.current.progress).toEqual({ displayType: 'number' });
    });
  });

  it('should reject when the initial page fetch fails', async () => {
    const fetchError = new Error('Failed to fetch records');

    mockFindManyRecordsLazy.mockResolvedValue({
      data: null,
      error: fetchError,
    });

    const { result } = renderHook(() =>
      useLazyFetchAllRecords({
        objectNameSingular: 'person',
        limit: 1,
      }),
    );

    let fetchPromise: Promise<unknown>;

    act(() => {
      fetchPromise = result.current.fetchAllRecords();
    });

    await expect(fetchPromise!).rejects.toThrow('Failed to fetch records');

    await waitFor(() => {
      expect(result.current.isDownloading).toBe(false);
      expect(result.current.progress).toEqual({ displayType: 'number' });
    });
  });
});
