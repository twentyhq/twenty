import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useIncrementalUpdateManyRecords } from '@/object-record/hooks/useIncrementalUpdateManyRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { renderHook } from '@testing-library/react';

import { useUpdateMultipleRecordsActions } from '../useUpdateMultipleRecordsActions';

jest.mock('@/context-store/utils/computeContextStoreFilters');
jest.mock('@/object-record/hooks/useIncrementalUpdateManyRecords');
jest.mock('@/object-record/record-filter/hooks/useFilterValueDependencies');
jest.mock(
  '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore',
);
jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar');
jest.mock('@/ui/utilities/state/component-state/hooks/useRecoilComponentValue');
const mockLinguiReturn = {
  i18n: { _: (id: any) => id },
  t: (...args: any[]) => 'success message',
};
jest.mock('@lingui/react/macro', () => ({
  useLingui: () => mockLinguiReturn,
  t: (...args: any[]) => 'success message',
}));
jest.mock('@lingui/react', () => ({
  useLingui: () => mockLinguiReturn,
}));

const mockComputeContextStoreFilters = jest.mocked(computeContextStoreFilters);
const mockUseIncrementalUpdateManyRecords = jest.mocked(
  useIncrementalUpdateManyRecords,
);
const mockUseFilterValueDependencies = jest.mocked(useFilterValueDependencies);
const mockUseRecordIndexIdFromCurrentContextStore = jest.mocked(
  useRecordIndexIdFromCurrentContextStore,
);
const mockUseSnackBar = jest.mocked(useSnackBar);
const mockUseRecoilComponentValue = jest.mocked(useRecoilComponentValue);

describe('useUpdateMultipleRecordsActions', () => {
  const mockIncrementalUpdateManyRecords = jest.fn();
  const mockEnqueueSuccessSnackBar = jest.fn();
  const mockEnqueueErrorSnackBar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseIncrementalUpdateManyRecords.mockReturnValue({
      incrementalUpdateManyRecords: mockIncrementalUpdateManyRecords,
      isProcessing: false,
      progress: { processedRecordCount: 5 },
      cancel: jest.fn(),
    } as any);

    mockUseSnackBar.mockReturnValue({
      enqueueSuccessSnackBar: mockEnqueueSuccessSnackBar,
      enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    } as any);

    mockUseRecordIndexIdFromCurrentContextStore.mockReturnValue({
      objectMetadataItem: { id: 'obj-meta-id' },
    } as any);

    mockUseFilterValueDependencies.mockReturnValue({
      filterValueDependencies: {},
    } as any);

    mockUseRecoilComponentValue.mockReturnValue({});

    mockComputeContextStoreFilters.mockReturnValue('mock-filter' as any);
  });

  it('should call incrementalUpdateManyRecords and show success snackbar', async () => {
    const { result } = renderHook(() =>
      useUpdateMultipleRecordsActions({
        objectNameSingular: 'company',
        contextStoreInstanceId: 'test-id',
      }),
    );

    await result.current.updateRecords({ name: 'New Name' });

    expect(mockIncrementalUpdateManyRecords).toHaveBeenCalledWith({
      name: 'New Name',
    });

    expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();
    expect(mockEnqueueSuccessSnackBar).toHaveBeenCalled();
  });

  it('should handle errors and show error snackbar', async () => {
    mockIncrementalUpdateManyRecords.mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() =>
      useUpdateMultipleRecordsActions({
        objectNameSingular: 'company',
        contextStoreInstanceId: 'test-id',
      }),
    );

    await result.current.updateRecords({ name: 'New Name' });

    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Update failed' }),
    );
  });

  it('should ignore AbortError', async () => {
    const error: any = new Error('Aborted');
    error.name = 'AbortError';
    mockIncrementalUpdateManyRecords.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useUpdateMultipleRecordsActions({
        objectNameSingular: 'company',
        contextStoreInstanceId: 'test-id',
      }),
    );

    await result.current.updateRecords({ name: 'New Name' });

    expect(mockEnqueueErrorSnackBar).not.toHaveBeenCalled();
    expect(mockEnqueueSuccessSnackBar).not.toHaveBeenCalled();
  });
});
