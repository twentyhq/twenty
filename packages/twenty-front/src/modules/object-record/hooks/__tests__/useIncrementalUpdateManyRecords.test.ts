import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIncrementalFetchAndMutateRecords } from '@/object-record/hooks/useIncrementalFetchAndMutateRecords';
import { useRegisterObjectOperation } from '@/object-record/hooks/useRegisterObjectOperation';
import { useUpdateManyRecordsMutation } from '@/object-record/hooks/useUpdateManyRecordsMutation';
import { renderHook } from '@testing-library/react';
import { useIncrementalUpdateManyRecords } from '../useIncrementalUpdateManyRecords';

jest.mock('@/object-metadata/hooks/useApolloCoreClient');
jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-record/hooks/useRegisterObjectOperation');
jest.mock('@/object-record/hooks/useUpdateManyRecordsMutation');
jest.mock('@/object-record/hooks/useRefetchAggregateQueries', () => ({
  useRefetchAggregateQueries: () => ({
    refetchAggregateQueries: jest.fn(),
  }),
}));
jest.mock('@/object-record/hooks/useIncrementalFetchAndMutateRecords');

const mockUseApolloCoreClient = jest.mocked(useApolloCoreClient);
const mockUseObjectMetadataItem = jest.mocked(useObjectMetadataItem);
const mockUseRegisterObjectOperation = jest.mocked(useRegisterObjectOperation);
const mockUseUpdateManyRecordsMutation = jest.mocked(
  useUpdateManyRecordsMutation,
);
const mockUseIncrementalFetchAndMutateRecords = jest.mocked(
  useIncrementalFetchAndMutateRecords,
);

describe('useIncrementalUpdateManyRecords', () => {
  const mockMutate = jest.fn();
  const mockRegisterObjectOperation = jest.fn();
  const mockIncrementalFetchAndMutate = jest.fn();
  const mockUpdateProgress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseApolloCoreClient.mockReturnValue({
      mutate: mockMutate,
    } as any);

    mockUseObjectMetadataItem.mockReturnValue({
      objectMetadataItem: {
        namePlural: 'companies',
      } as any,
    });

    mockUseRegisterObjectOperation.mockReturnValue({
      registerObjectOperation: mockRegisterObjectOperation,
    });

    mockUseUpdateManyRecordsMutation.mockReturnValue({
      updateManyRecordsMutation: 'UPDATE_MUTATION' as any,
    });

    mockUseIncrementalFetchAndMutateRecords.mockReturnValue({
      incrementalFetchAndMutate: mockIncrementalFetchAndMutate,
      progress: { displayType: 'number' },
      isProcessing: false,
      updateProgress: mockUpdateProgress,
      cancel: jest.fn(),
    });
  });

  it('should call incrementalFetchAndMutate and execute mutations', async () => {
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
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: 'UPDATE_MUTATION',
        variables: {
          filter: { id: { in: ['1', '2'] } },
          data: { name: 'New Name' },
        },
      }),
    );
    expect(mockUpdateProgress).toHaveBeenCalledWith(2, 2);
    expect(mockRegisterObjectOperation).toHaveBeenCalledWith(
      expect.anything(),
      {
        type: 'update-many',
        result: {
          updateInputs: [{ name: 'New Name' }],
        },
      },
    );
  });

  it('should pass abortSignal to mutation', async () => {
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
