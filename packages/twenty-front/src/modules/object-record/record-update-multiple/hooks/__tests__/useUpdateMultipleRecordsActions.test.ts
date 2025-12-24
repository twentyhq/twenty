import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useIncrementalUpdateManyRecords } from '@/object-record/hooks/useIncrementalUpdateManyRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { renderHook } from '@testing-library/react';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useUpdateMultipleRecordsActions } from '@/object-record/record-update-multiple/hooks/useUpdateMultipleRecordsActions';

jest.mock('@/context-store/utils/computeContextStoreFilters');
jest.mock('@/object-record/hooks/useIncrementalUpdateManyRecords');
jest.mock('@/object-record/record-filter/hooks/useFilterValueDependencies');
jest.mock('@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow');
jest.mock('@/ui/utilities/state/component-state/hooks/useRecoilComponentValue');

const mockComputeContextStoreFilters = jest.mocked(computeContextStoreFilters);
const mockUseIncrementalUpdateManyRecords = jest.mocked(
  useIncrementalUpdateManyRecords,
);
const mockUseFilterValueDependencies = jest.mocked(useFilterValueDependencies);
const mockUseContextStoreObjectMetadataItemOrThrow = jest.mocked(
  useContextStoreObjectMetadataItemOrThrow,
);
const mockUseRecoilComponentValue = jest.mocked(useRecoilComponentValue);

describe('useUpdateMultipleRecordsActions', () => {
  const mockIncrementalUpdateManyRecords = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIncrementalUpdateManyRecords.mockResolvedValue(5);

    mockUseIncrementalUpdateManyRecords.mockReturnValue({
      incrementalUpdateManyRecords: mockIncrementalUpdateManyRecords,
      isProcessing: false,
      progress: { processedRecordCount: 5 },
      cancel: jest.fn(),
    } as any);

    mockUseContextStoreObjectMetadataItemOrThrow.mockReturnValue({
      objectMetadataItem: { id: 'obj-meta-id' },
    } as any);

    mockUseFilterValueDependencies.mockReturnValue({
      filterValueDependencies: {},
    } as any);

    mockUseRecoilComponentValue.mockReturnValue({});

    mockComputeContextStoreFilters.mockReturnValue('mock-filter' as any);
  });

  it('should call incrementalUpdateManyRecords and return the count', async () => {
    const { result } = renderHook(() =>
      useUpdateMultipleRecordsActions({
        objectNameSingular: 'company',
        contextStoreInstanceId: 'test-id',
      }),
    );

    const count = await result.current.updateRecords({ name: 'New Name' });

    expect(mockIncrementalUpdateManyRecords).toHaveBeenCalledWith({
      name: 'New Name',
    });
    expect(count).toBe(5);
  });

  it('should throw error when update fails', async () => {
    mockIncrementalUpdateManyRecords.mockRejectedValue(
      new Error('Update failed'),
    );

    const { result } = renderHook(() =>
      useUpdateMultipleRecordsActions({
        objectNameSingular: 'company',
        contextStoreInstanceId: 'test-id',
      }),
    );

    await expect(
      result.current.updateRecords({ name: 'New Name' }),
    ).rejects.toThrow('Update failed');
  });
});
