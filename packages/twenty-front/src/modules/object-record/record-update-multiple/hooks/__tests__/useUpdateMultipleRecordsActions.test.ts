import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useIncrementalUpdateManyRecords } from '@/object-record/hooks/useIncrementalUpdateManyRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useUpdateMultipleRecordsActions } from '@/object-record/record-update-multiple/hooks/useUpdateMultipleRecordsActions';

vi.mock('@/context-store/utils/computeContextStoreFilters');
vi.mock('@/object-record/hooks/useIncrementalUpdateManyRecords');
vi.mock('@/object-record/record-filter/hooks/useFilterValueDependencies');
vi.mock('@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow');
vi.mock('@/ui/utilities/state/component-state/hooks/useRecoilComponentValue');

const mockComputeContextStoreFilters = vi.mocked(computeContextStoreFilters);
const mockUseIncrementalUpdateManyRecords = vi.mocked(
  useIncrementalUpdateManyRecords,
);
const mockUseFilterValueDependencies = vi.mocked(useFilterValueDependencies);
const mockUseContextStoreObjectMetadataItemOrThrow = vi.mocked(
  useContextStoreObjectMetadataItemOrThrow,
);
const mockUseRecoilComponentValue = vi.mocked(useRecoilComponentValue);

describe('useUpdateMultipleRecordsActions', () => {
  const mockIncrementalUpdateManyRecords = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIncrementalUpdateManyRecords.mockResolvedValue(5);

    mockUseIncrementalUpdateManyRecords.mockReturnValue({
      incrementalUpdateManyRecords: mockIncrementalUpdateManyRecords,
      isProcessing: false,
      progress: { processedRecordCount: 5 },
      cancel: vi.fn(),
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
