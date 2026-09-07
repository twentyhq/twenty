import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { useRemoveNavigationMenuItemByTargetRecordId } from '@/navigation-menu-item/common/hooks/useRemoveNavigationMenuItemByTargetRecordId';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIncrementalDeleteManyRecords } from '@/object-record/hooks/useIncrementalDeleteManyRecords';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useRefetchAggregateQueries } from '@/object-record/hooks/useRefetchAggregateQueries';
import { renderHook } from '@testing-library/react';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-metadata/hooks/useApolloCoreClient');
jest.mock('@/object-record/hooks/useIncrementalFetchAndMutateRecords');
jest.mock('@/object-record/hooks/useRefetchAggregateQueries');
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
const mockUseRefetchAggregateQueries = jest.mocked(useRefetchAggregateQueries);
const mockDispatchObjectRecordOperationBrowserEvent = jest.mocked(
  dispatchObjectRecordOperationBrowserEvent,
);
const mockUseRemoveNavigationMenuItemByTargetRecordId = jest.mocked(
  useRemoveNavigationMenuItemByTargetRecordId,
);

const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');

describe('useIncrementalDeleteManyRecords', () => {
  const mockIncrementalFetchAndMutate = jest.fn();
  const mockRemoveNavigationMenuItemsByTargetRecordIds = jest.fn();
  const mockRefetchAggregateQueries = jest.fn();
  const mockMutate = jest.fn();

  const renderDeleteHook = () =>
    renderHook(() =>
      useIncrementalDeleteManyRecords({
        objectNameSingular: 'company',
        delayInMsBetweenMutations: 0,
      }),
    );

  const deleteBatchOf = (recordIds: string[]) => ({
    recordIds,
    totalFetchedCount: recordIds.length,
    totalCount: recordIds.length,
    abortSignal: new AbortController().signal,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseObjectMetadataItem.mockReturnValue({ objectMetadataItem });

    mockMutate.mockResolvedValue({});
    mockUseApolloCoreClient.mockReturnValue({
      mutate: mockMutate,
      cache: {},
    } as unknown as ReturnType<typeof useApolloCoreClient>);

    mockUseIncrementalFetchAndMutateRecords.mockReturnValue({
      incrementalFetchAndMutate: mockIncrementalFetchAndMutate,
      progress: { displayType: 'number' },
      isProcessing: false,
      updateProgress: jest.fn(),
      cancel: jest.fn(),
    });

    mockRefetchAggregateQueries.mockResolvedValue(undefined);
    mockUseRefetchAggregateQueries.mockReturnValue({
      refetchAggregateQueries: mockRefetchAggregateQueries,
    });

    mockUseRemoveNavigationMenuItemByTargetRecordId.mockReturnValue({
      removeNavigationMenuItemsByTargetRecordIds:
        mockRemoveNavigationMenuItemsByTargetRecordIds,
    });
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

    expect(mockDispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledTimes(
      1,
    );
    expect(mockDispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledWith({
      objectMetadataItem,
      operation: {
        type: 'delete-many',
        deletedRecordIds: ['record-1', 'record-2', 'record-3'],
      },
    });
    expect(
      mockRemoveNavigationMenuItemsByTargetRecordIds,
    ).toHaveBeenCalledTimes(1);
    expect(mockRemoveNavigationMenuItemsByTargetRecordIds).toHaveBeenCalledWith(
      ['record-1', 'record-2', 'record-3'],
    );
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
    expect(mockRefetchAggregateQueries).toHaveBeenCalledWith({
      objectMetadataNamePlural: objectMetadataItem.namePlural,
    });
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

    expect(mockDispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledTimes(
      1,
    );
    expect(mockDispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledWith({
      objectMetadataItem,
      operation: {
        type: 'delete-many',
        deletedRecordIds: ['record-1', 'record-2'],
      },
    });
    expect(
      mockRemoveNavigationMenuItemsByTargetRecordIds,
    ).toHaveBeenCalledTimes(1);
    expect(mockRemoveNavigationMenuItemsByTargetRecordIds).toHaveBeenCalledWith(
      ['record-1', 'record-2'],
    );
    expect(mockRefetchAggregateQueries).toHaveBeenCalledTimes(1);
  });

  it('should not report a deletion when no record was deleted', async () => {
    mockIncrementalFetchAndMutate.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderDeleteHook();

    await expect(result.current.incrementalDeleteManyRecords()).rejects.toThrow(
      'Fetch failed',
    );

    expect(
      mockDispatchObjectRecordOperationBrowserEvent,
    ).not.toHaveBeenCalled();
    expect(
      mockRemoveNavigationMenuItemsByTargetRecordIds,
    ).not.toHaveBeenCalled();
  });

  it('should keep the deletion error when the aggregate refetch also fails', async () => {
    mockIncrementalFetchAndMutate.mockImplementation(async (mutateBatch) => {
      await mutateBatch(deleteBatchOf(['record-1']));

      throw new Error('Deletion failed');
    });
    mockRefetchAggregateQueries.mockRejectedValue(new Error('Refetch failed'));

    const { result } = renderDeleteHook();

    await expect(result.current.incrementalDeleteManyRecords()).rejects.toThrow(
      'Deletion failed',
    );

    expect(mockDispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should surface a failing aggregate refetch when the deletion succeeded', async () => {
    mockIncrementalFetchAndMutate.mockImplementation(async (mutateBatch) => {
      await mutateBatch(deleteBatchOf(['record-1']));
    });
    mockRefetchAggregateQueries.mockRejectedValue(new Error('Refetch failed'));

    const { result } = renderDeleteHook();

    await expect(result.current.incrementalDeleteManyRecords()).rejects.toThrow(
      'Refetch failed',
    );
  });
});
