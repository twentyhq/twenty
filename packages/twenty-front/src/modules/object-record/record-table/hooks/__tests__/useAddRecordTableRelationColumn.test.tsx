import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useAddRecordTableRelationColumn } from '@/object-record/record-table/hooks/useAddRecordTableRelationColumn';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const performViewFieldApiCreateMock = jest.fn();

jest.mock('@/views/hooks/internal/usePerformViewFieldApiPersist', () => ({
  usePerformViewFieldApiPersist: () => ({
    performViewFieldApiCreate: performViewFieldApiCreateMock,
  }),
}));

jest.mock('@/views/hooks/useGetCurrentViewOnly', () => ({
  useGetCurrentViewOnly: () => ({ currentView: { id: 'view-id' } }),
}));

const RECORD_TABLE_ID = 'record-table-id';

const companyColumn: RecordField = {
  id: 'company-column',
  fieldMetadataItemId: 'company-field',
  position: 1,
  isVisible: true,
  size: 100,
};

const currentRecordFieldsAtom = currentRecordFieldsComponentState.atomFamily({
  instanceId: RECORD_TABLE_ID,
});

const renderAddHook = (store: ReturnType<typeof createStore>) =>
  renderHook(() => useAddRecordTableRelationColumn(RECORD_TABLE_ID), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

describe('useAddRecordTableRelationColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the lookup column and saves it as a non-canonical view field', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [companyColumn]);
    performViewFieldApiCreateMock.mockResolvedValue({ status: 'successful' });

    const { result } = renderAddHook(store);

    const isAdded = await act(() =>
      result.current.addRecordTableRelationColumn({
        relationFieldMetadataItemId: 'company-field',
        relationTargetFieldMetadataId: 'industry-field',
      }),
    );

    const lookupColumn = store.get(currentRecordFieldsAtom)[1];

    expect(isAdded).toBe(true);
    expect(lookupColumn).toMatchObject({
      fieldMetadataItemId: 'company-field',
      relationTargetFieldMetadataId: 'industry-field',
      isCanonical: false,
    });
    expect(performViewFieldApiCreateMock).toHaveBeenCalledWith({
      inputs: [
        expect.objectContaining({
          id: lookupColumn.id,
          viewId: 'view-id',
          fieldMetadataId: 'company-field',
          relationTargetFieldMetadataId: 'industry-field',
          isCanonical: false,
        }),
      ],
    });
  });

  it('saves an aggregate column with its operation and target field', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [companyColumn]);
    performViewFieldApiCreateMock.mockResolvedValue({ status: 'successful' });

    const { result } = renderAddHook(store);

    await act(() =>
      result.current.addRecordTableRelationColumn({
        relationFieldMetadataItemId: 'opportunities-field',
        relationTargetFieldMetadataId: 'amount-field',
        relationAggregateOperation: AggregateOperations.SUM,
      }),
    );

    expect(performViewFieldApiCreateMock).toHaveBeenCalledWith({
      inputs: [
        expect.objectContaining({
          fieldMetadataId: 'opportunities-field',
          relationTargetFieldMetadataId: 'amount-field',
          relationAggregateOperation: AggregateOperations.SUM,
          isCanonical: false,
        }),
      ],
    });
  });

  it('removes the column when the save fails', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [companyColumn]);
    performViewFieldApiCreateMock.mockResolvedValue({ status: 'failed' });

    const { result } = renderAddHook(store);

    await act(async () => {
      await result.current.addRecordTableRelationColumn({
        relationFieldMetadataItemId: 'company-field',
        relationTargetFieldMetadataId: 'industry-field',
      });
    });

    expect(store.get(currentRecordFieldsAtom)).toEqual([companyColumn]);
  });
});
