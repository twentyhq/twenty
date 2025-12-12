import { triggerUpdateRecordOptimisticEffectByBatch } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffectByBatch';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useDeleteManyRecordsMutation } from '@/object-record/hooks/useDeleteManyRecordsMutation';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { renderHook } from '@testing-library/react';
import { useIncrementalDeleteManyRecords } from '../useIncrementalDeleteManyRecords';

jest.mock(
  '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffectByBatch',
);
jest.mock('@/object-metadata/hooks/useApolloCoreClient');
jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));
jest.mock('@/object-record/cache/hooks/useGetRecordFromCache');
jest.mock('@/object-record/hooks/useDeleteManyRecordsMutation');
jest.mock('@/object-record/hooks/useIncrementalFetchAndMutateRecords');
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));
jest.mock('@/object-record/hooks/useRefetchAggregateQueries', () => ({
  useRefetchAggregateQueries: () => ({
    refetchAggregateQueries: jest.fn(),
  }),
}));
jest.mock('@/object-record/hooks/useRegisterObjectOperation');
jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({ upsertRecordsInStore: jest.fn() }),
}));
jest.mock('~/utils/sleep', () => ({
  sleep: jest.fn(),
}));

const mockUseApolloCoreClient = jest.mocked(useApolloCoreClient);
const mockUseObjectMetadataItem = jest.mocked(useObjectMetadataItem);
const mockUseGetRecordFromCache = jest.mocked(useGetRecordFromCache);
const mockUseDeleteManyRecordsMutation = jest.mocked(
  useDeleteManyRecordsMutation,
);
const mockUseIncrementalFetchAndMutateRecords = jest.mocked(
  useIncrementalFetchAndMutateRecords,
);
const mockUseRegisterObjectOperation = jest.mocked(useRegisterObjectOperation);
const mockTriggerUpdateRecordOptimisticEffectByBatch = jest.mocked(
  triggerUpdateRecordOptimisticEffectByBatch,
);

describe('useIncrementalDeleteManyRecords', () => {
  const mockMutate = jest.fn();
  const mockRegisterObjectOperation = jest.fn();
  const mockIncrementalFetchAndMutate = jest.fn();
  const mockUpdateProgress = jest.fn();
  const mockGetRecordFromCache = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockMutate.mockResolvedValue({ data: {} });

    mockUseApolloCoreClient.mockReturnValue({
      mutate: mockMutate,
      cache: {
        identify: jest.fn(),
        writeFragment: jest.fn(),
      },
    } as any);

    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: {
        namePlural: 'companies',
        nameSingular: 'company',
        fields: [],
        readableFields: [],
      } as any,
    });

    mockUseGetRecordFromCache.mockReturnValue(mockGetRecordFromCache);

    mockUseRegisterObjectOperation.mockReturnValue({
      registerObjectOperation: mockRegisterObjectOperation,
    });

    mockUseDeleteManyRecordsMutation.mockReturnValue({
      deleteManyRecordsMutation: 'DELETE_MUTATION' as any,
    });

    mockUseIncrementalFetchAndMutateRecords.mockReturnValue({
      incrementalFetchAndMutate: mockIncrementalFetchAndMutate,
      progress: { displayType: 'number' },
      isProcessing: false,
      updateProgress: mockUpdateProgress,
      cancel: jest.fn(),
    });
  });

  it('should call incrementalFetchAndMutate and execute mutations with optimistic updates', async () => {
    mockGetRecordFromCache.mockReturnValue({ id: '1', __typename: 'Company' });

    mockIncrementalFetchAndMutate.mockImplementation(async (callback) => {
      await callback({
        recordIds: ['1'],
        totalCount: 1,
        totalFetchedCount: 1,
        abortSignal: new AbortController().signal,
      });
    });

    const { result } = renderHook(() =>
      useIncrementalDeleteManyRecords({
        objectNameSingular: 'company',
      } as any),
    );

    await result.current.incrementalDeleteManyRecords();

    expect(mockIncrementalFetchAndMutate).toHaveBeenCalled();
    expect(mockGetRecordFromCache).toHaveBeenCalledWith('1', expect.anything());

    // Verify optimistic effect triggered
    expect(mockTriggerUpdateRecordOptimisticEffectByBatch).toHaveBeenCalled();

    // Verify mutation called
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: 'DELETE_MUTATION',
        variables: {
          filter: { id: { in: ['1'] } },
        },
      }),
    );

    expect(mockUpdateProgress).toHaveBeenCalledWith(1, 1);
    expect(mockRegisterObjectOperation).toHaveBeenCalledWith(
      expect.anything(),
      { type: 'delete-many' },
    );
  });

  it('should pass abortSignal to mutation', async () => {
    const abortController = new AbortController();
    mockGetRecordFromCache.mockReturnValue({ id: '1', __typename: 'Company' });

    mockIncrementalFetchAndMutate.mockImplementation(async (callback) => {
      await callback({
        recordIds: ['1'],
        totalCount: 1,
        totalFetchedCount: 1,
        abortSignal: abortController.signal,
      });
    });

    const { result } = renderHook(() =>
      useIncrementalDeleteManyRecords({
        objectNameSingular: 'company',
      } as any),
    );

    await result.current.incrementalDeleteManyRecords();

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          fetchOptions: {
            signal: abortController.signal,
          },
        },
      }),
    );
  });
});
