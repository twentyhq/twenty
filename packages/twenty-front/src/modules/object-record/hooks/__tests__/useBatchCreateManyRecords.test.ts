import { renderHook } from '@testing-library/react';

import { useBatchCreateManyRecords } from '@/object-record/hooks/useBatchCreateManyRecords';

const mockCreateManyRecords = jest.fn();
const mockRefetchAggregateQueries = jest.fn().mockResolvedValue(undefined);

jest.mock('@/object-record/hooks/useCreateManyRecords', () => ({
  useCreateManyRecords: () => ({ createManyRecords: mockCreateManyRecords }),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: { namePlural: 'people' },
  }),
}));
jest.mock('@/object-record/hooks/useRefetchAggregateQueries', () => ({
  useRefetchAggregateQueries: () => ({
    refetchAggregateQueries: mockRefetchAggregateQueries,
  }),
}));
jest.mock('@/localization/hooks/useNumberFormat', () => ({
  useNumberFormat: () => ({ formatNumber: String }),
}));
jest.mock(
  '@/browser-event/utils/dispatchObjectRecordOperationBrowserEvent',
  () => ({ dispatchObjectRecordOperationBrowserEvent: jest.fn() }),
);
jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

describe('batch creation confirmed progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateManyRecords.mockReset();
  });

  it('reports only successful batches before a failure', async () => {
    mockCreateManyRecords
      .mockResolvedValueOnce([{ id: 'saved' }])
      .mockRejectedValueOnce(new Error('Failed'));
    const onBatchCompleted = jest.fn();
    const setBatchedRecordsCount = jest.fn();
    const { result } = renderHook(() =>
      useBatchCreateManyRecords({
        objectNameSingular: 'person',
        mutationBatchSize: 1,
        setBatchedRecordsCount,
      }),
    );
    await expect(
      result.current.batchCreateManyRecords({
        recordsToCreate: [{}, {}],
        onBatchCompleted,
      }),
    ).rejects.toThrow('Failed');
    expect(onBatchCompleted.mock.calls).toEqual([[1]]);
    expect(setBatchedRecordsCount.mock.calls).toEqual([[0], [1]]);
  });

  it('reports the final incomplete batch after success', async () => {
    mockCreateManyRecords
      .mockResolvedValueOnce([{ id: 'one' }, { id: 'two' }])
      .mockResolvedValueOnce([{ id: 'three' }]);
    const onBatchCompleted = jest.fn();
    const { result } = renderHook(() =>
      useBatchCreateManyRecords({
        objectNameSingular: 'person',
        mutationBatchSize: 2,
      }),
    );
    const records = await result.current.batchCreateManyRecords({
      recordsToCreate: [{}, {}, {}],
      onBatchCompleted,
    });
    expect(records).toHaveLength(3);
    expect(onBatchCompleted.mock.calls).toEqual([[2], [3]]);
  });
});
