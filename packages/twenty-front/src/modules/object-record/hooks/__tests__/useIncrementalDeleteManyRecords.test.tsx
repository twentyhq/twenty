import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { useRemoveNavigationMenuItemByTargetRecordId } from '@/navigation-menu-item/common/hooks/useRemoveNavigationMenuItemByTargetRecordId';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIncrementalDeleteManyRecords } from '@/object-record/hooks/useIncrementalDeleteManyRecords';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { renderHook } from '@testing-library/react';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-metadata/hooks/useApolloCoreClient');
jest.mock('@/object-record/hooks/useIncrementalFetchAndMutateRecords');
jest.mock('@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent');
jest.mock(
  '@/navigation-menu-item/common/hooks/useRemoveNavigationMenuItemByTargetRecordId',
);
jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));
jest.mock('@/object-record/hooks/useDeleteManyRecordsMutation', () => ({
  useDeleteManyRecordsMutation: () => ({ deleteManyRecordsMutation: {} }),
}));
jest.mock('@/object-record/cache/hooks/useGetRecordFromCache', () => ({
  useGetRecordFromCache: () => () => undefined,
}));
jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));
jest.mock('@/object-record/hooks/useRefetchAggregateQueries', () => ({
  useRefetchAggregateQueries: () => ({
    refetchAggregateQueries: jest.fn(),
  }),
}));
jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({ upsertRecordsInStore: jest.fn() }),
}));
jest.mock(
  '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffectByBatch',
  () => ({
    triggerUpdateRecordOptimisticEffectByBatch: jest.fn(),
  }),
);

const mockUseObjectMetadataItem = jest.mocked(useObjectMetadataItem);
const mockUseApolloCoreClient = jest.mocked(useApolloCoreClient);
const mockUseIncrementalFetchAndMutateRecords = jest.mocked(
  useIncrementalFetchAndMutateRecords,
);
const mockDispatchObjectRecordOperationBrowserEvent = jest.mocked(
  dispatchObjectRecordOperationBrowserEvent,
);
const mockUseRemoveNavigationMenuItemByTargetRecordId = jest.mocked(
  useRemoveNavigationMenuItemByTargetRecordId,
);

describe('useIncrementalDeleteManyRecords', () => {
  const mockIncrementalFetchAndMutate = jest.fn();
  const mockRemoveNavigationMenuItemsByTargetRecordIds = jest.fn();
  const mockMutate = jest.fn();

  const renderDeleteHook = () =>
    renderHook(() =>
      useIncrementalDeleteManyRecords({
        objectNameSingular: 'company',
        delayInMsBetweenMutations: 0,
      }),
    );

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: {
        id: 'object-metadata-id',
        nameSingular: 'company',
        namePlural: 'companies',
        fields: [],
      } as any,
    });

    mockMutate.mockResolvedValue({});
    mockUseApolloCoreClient.mockReturnValue({
      mutate: mockMutate,
      cache: {},
    } as any);

    mockUseIncrementalFetchAndMutateRecords.mockReturnValue({
      incrementalFetchAndMutate: mockIncrementalFetchAndMutate,
      progress: { displayType: 'number' },
      isProcessing: false,
      updateProgress: jest.fn(),
      cancel: jest.fn(),
    } as any);

    mockUseRemoveNavigationMenuItemByTargetRecordId.mockReturnValue({
      removeNavigationMenuItemsByTargetRecordIds:
        mockRemoveNavigationMenuItemsByTargetRecordIds,
    } as any);
  });

  const deleteBatchOf = (recordIds: string[]) => ({
    recordIds,
    totalFetchedCount: recordIds.length,
    totalCount: recordIds.length,
    abortSignal: new AbortController().signal,
  });

  it('should report every deleted record when all batches succeed', async () => {
    mockIncrementalFetchAndMutate.mockImplementation(async (mutateBatch) => {
      await mutateBatch(deleteBatchOf(['record-1', 'record-2']));
      await mutateBatch(deleteBatchOf(['record-3']));
    });

    const { result } = renderDeleteHook();

    await expect(result.current.incrementalDeleteManyRecords()).resolves.toBe(
      3,
    );

    expect(mockDispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: {
          type: 'delete-many',
          deletedRecordIds: ['record-1', 'record-2', 'record-3'],
        },
      }),
    );
  });

  it('should report the records a failing run already deleted', async () => {
    mockIncrementalFetchAndMutate.mockImplementation(async (mutateBatch) => {
      await mutateBatch(deleteBatchOf(['record-1', 'record-2']));

      throw new Error('Deletion failed');
    });

    const { result } = renderDeleteHook();

    await expect(result.current.incrementalDeleteManyRecords()).rejects.toThrow(
      'Deletion failed',
    );

    expect(mockDispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: {
          type: 'delete-many',
          deletedRecordIds: ['record-1', 'record-2'],
        },
      }),
    );
    expect(mockRemoveNavigationMenuItemsByTargetRecordIds).toHaveBeenCalledWith(
      ['record-1', 'record-2'],
    );
  });
});
