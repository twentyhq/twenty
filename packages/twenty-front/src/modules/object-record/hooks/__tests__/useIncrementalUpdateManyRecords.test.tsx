import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useIncrementalUpdateManyRecords } from '@/object-record/hooks/useIncrementalUpdateManyRecords';
import { useUpdateManyRecords } from '@/object-record/hooks/useUpdateManyRecords';
import { dispatchObjectRecordOperationBrowserEvent } from '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent';
import { renderHook } from '@testing-library/react';

jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent');
jest.mock('@/object-record/hooks/useUpdateManyRecords', () => ({
  useUpdateManyRecords: jest.fn(),
}));
jest.mock('@/object-record/hooks/useRefetchAggregateQueries', () => ({
  useRefetchAggregateQueries: () => ({
    refetchAggregateQueries: jest.fn(),
  }),
}));
jest.mock('@/object-record/hooks/useIncrementalFetchAndMutateRecords');

const mockUseObjectMetadataItem = jest.mocked(useObjectMetadataItem);
const mockDispatchObjectRecordOperationBrowserEvent = jest.mocked(
  dispatchObjectRecordOperationBrowserEvent,
);
const mockUseUpdateManyRecords = jest.mocked(useUpdateManyRecords);
const mockUseIncrementalFetchAndMutateRecords = jest.mocked(
  useIncrementalFetchAndMutateRecords,
);

describe('useIncrementalUpdateManyRecords', () => {
  const mockUpdateManyRecords = jest.fn();
  const mockIncrementalFetchAndMutate = jest.fn();
  const mockUpdateProgress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: {
        namePlural: 'companies',
      } as any,
    });

    mockDispatchObjectRecordOperationBrowserEvent.mockImplementation(jest.fn());

    mockUseUpdateManyRecords.mockReturnValue({
      updateManyRecords: mockUpdateManyRecords,
    });

    mockUseIncrementalFetchAndMutateRecords.mockReturnValue({
      incrementalFetchAndMutate: mockIncrementalFetchAndMutate,
      progress: { displayType: 'number' },
      isProcessing: false,
      updateProgress: mockUpdateProgress,
      cancel: jest.fn(),
    });
  });

  it('should call incrementalFetchAndMutate and execute mutations via useUpdateManyRecords', async () => {
    mockIncrementalFetchAndMutate.mockImplementation(async (callback) => {
      // Simulate one batch
      await callback({
        recordIds: ['1', '2'],
        totalCount: 2,
        totalFetchedCount: 2,
        abortSignal: new AbortController().signal,
      });
    });

    const { result } = renderHook(() =>
      useIncrementalUpdateManyRecords({
        objectNameSingular: 'company',
      } as any),
    );

    await result.current.incrementalUpdateManyRecords({ name: 'New Name' });

    expect(mockIncrementalFetchAndMutate).toHaveBeenCalled();
    expect(mockUpdateManyRecords).toHaveBeenCalledWith({
      recordIdsToUpdate: ['1', '2'],
      updateOneRecordInput: { name: 'New Name' },
      delayInMsBetweenRequests: 50,
      skipRegisterObjectOperation: true,
      skipRefetchAggregateQueries: true,
      abortSignal: expect.any(AbortSignal),
    });
    expect(mockUpdateProgress).toHaveBeenCalledWith(2, 2);
    expect(mockDispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledWith({
      objectMetadataItem: expect.anything(),
      operation: {
        type: 'update-many',
        result: {
          updateInputs: [
            {
              recordId: '1',
              updatedFields: [{ name: 'New Name' }],
            },
            {
              recordId: '2',
              updatedFields: [{ name: 'New Name' }],
            },
          ],
        },
      },
    });
  });

  it('should pass abortSignal to updateManyRecords', async () => {
    const abortController = new AbortController();
    mockIncrementalFetchAndMutate.mockImplementation(async (callback) => {
      await callback({
        recordIds: ['1'],
        totalCount: 1,
        totalFetchedCount: 1,
        abortSignal: abortController.signal,
      });
    });

    const { result } = renderHook(() =>
      useIncrementalUpdateManyRecords({
        objectNameSingular: 'company',
      } as any),
    );

    await result.current.incrementalUpdateManyRecords({ name: 'New Name' });

    expect(mockUpdateManyRecords).toHaveBeenCalledWith(
      expect.objectContaining({
        abortSignal: abortController.signal,
      }),
    );
  });

  it('should execute cleanup actions (refetch aggregates, register operation) even if processing fails', async () => {
    mockIncrementalFetchAndMutate.mockRejectedValue(
      new Error('Process failed'),
    );

    const { result } = renderHook(() =>
      useIncrementalUpdateManyRecords({
        objectNameSingular: 'company',
      } as any),
    );

    await expect(
      result.current.incrementalUpdateManyRecords({ name: 'New Name' }),
    ).rejects.toThrow('Process failed');

    expect(mockDispatchObjectRecordOperationBrowserEvent).toHaveBeenCalledWith({
      objectMetadataItem: expect.anything(),
      operation: {
        type: 'update-many',
        result: {
          updateInputs: [],
        },
      },
    });
  });
});
