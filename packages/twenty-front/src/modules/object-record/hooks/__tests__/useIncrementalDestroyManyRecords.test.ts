import { triggerDestroyRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useDestroyManyRecordsMutation } from '@/object-record/hooks/useDestroyManyRecordsMutation';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { renderHook } from '@testing-library/react';
import { useIncrementalDestroyManyRecords } from '../useIncrementalDestroyManyRecords';

jest.mock(
  '@/apollo/optimistic-effect/utils/triggerDestroyRecordsOptimisticEffect',
);
jest.mock(
  '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect',
  () => ({
    triggerCreateRecordsOptimisticEffect: jest.fn(),
  }),
);
jest.mock('@/object-metadata/hooks/useApolloCoreClient');
jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));
jest.mock('@/object-record/cache/hooks/useGetRecordFromCache');
jest.mock('@/object-record/hooks/useDestroyManyRecordsMutation');
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
const mockUseDestroyManyRecordsMutation = jest.mocked(
  useDestroyManyRecordsMutation,
);
const mockUseIncrementalFetchAndMutateRecords = jest.mocked(
  useIncrementalFetchAndMutateRecords,
);
const mockUseRegisterObjectOperation = jest.mocked(useRegisterObjectOperation);
const mockTriggerDestroyRecordsOptimisticEffect = jest.mocked(
  triggerDestroyRecordsOptimisticEffect,
);

describe('useIncrementalDestroyManyRecords', () => {
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

    mockUseDestroyManyRecordsMutation.mockReturnValue({
      destroyManyRecordsMutation: 'DESTROY_MUTATION' as any,
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

    mockMutate.mockImplementation(async (options) => {
      // Execute the update callback if provided
      if (options?.update !== undefined) {
        options.update(
          {} as any,
          {
            data: {
              destroyCompanies: [{ id: '1', __typename: 'Company' }],
            },
          } as any,
        );
      }
      return { data: {} };
    });

    mockIncrementalFetchAndMutate.mockImplementation(async (callback) => {
      await callback({
        recordIds: ['1'],
        totalCount: 1,
        totalFetchedCount: 1,
        abortSignal: new AbortController().signal,
      });
    });

    const { result } = renderHook(() =>
      useIncrementalDestroyManyRecords({
        objectNameSingular: 'company',
      } as any),
    );

    await result.current.incrementalDestroyManyRecords();

    expect(mockIncrementalFetchAndMutate).toHaveBeenCalled();
    expect(mockGetRecordFromCache).toHaveBeenCalledWith('1', expect.anything());

    // Verify mutation called
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: 'DESTROY_MUTATION',
        variables: {
          filter: { id: { in: ['1'] } },
        },
      }),
    );

    // Verify optimistic effect triggered via update callback
    expect(mockTriggerDestroyRecordsOptimisticEffect).toHaveBeenCalled();

    expect(mockUpdateProgress).toHaveBeenCalledWith(1, 1);
    expect(mockRegisterObjectOperation).toHaveBeenCalledWith(
      expect.anything(),
      { type: 'destroy-many' },
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
      useIncrementalDestroyManyRecords({
        objectNameSingular: 'company',
      } as any),
    );

    await result.current.incrementalDestroyManyRecords();

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
