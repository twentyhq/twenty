import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useAddRecordTableLookupColumn } from '@/object-record/record-table/hooks/useAddRecordTableLookupColumn';
import { ViewType } from '@/views/types/ViewType';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const performViewFieldApiCreateMock = jest.fn();

jest.mock('@/views/hooks/internal/usePerformViewFieldApiPersist', () => ({
  usePerformViewFieldApiPersist: () => ({
    performViewFieldApiCreate: performViewFieldApiCreateMock,
  }),
}));

const RECORD_TABLE_ID = 'record-table-id';
const CONTEXT_STORE_INSTANCE_ID = 'context-store-instance-id';

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

const renderAddHook = (store: ReturnType<typeof createStore>) => {
  store.set(
    contextStoreCurrentViewIdComponentState.atomFamily({
      instanceId: CONTEXT_STORE_INSTANCE_ID,
    }),
    'view-id',
  );

  return renderHook(() => useAddRecordTableLookupColumn(RECORD_TABLE_ID), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: CONTEXT_STORE_INSTANCE_ID }}
        >
          {children}
        </ContextStoreComponentInstanceContext.Provider>
      </JotaiProvider>
    ),
  });
};

describe('useAddRecordTableLookupColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the lookup column and saves it as a non-canonical view field', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [companyColumn]);
    performViewFieldApiCreateMock.mockResolvedValue({ status: 'successful' });

    const { result } = renderAddHook(store);

    const isAdded = await act(() =>
      result.current.addRecordTableLookupColumn({
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

  it('keeps the lookup column when a view field sync drops it during the save', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [companyColumn]);
    performViewFieldApiCreateMock.mockImplementation(async () => {
      store.set(currentRecordFieldsAtom, [companyColumn]);

      return { status: 'successful' };
    });

    const { result } = renderAddHook(store);

    await act(async () => {
      await result.current.addRecordTableLookupColumn({
        relationFieldMetadataItemId: 'company-field',
        relationTargetFieldMetadataId: 'industry-field',
      });
    });

    expect(store.get(currentRecordFieldsAtom)).toEqual([
      companyColumn,
      expect.objectContaining({
        relationTargetFieldMetadataId: 'industry-field',
      }),
    ]);
  });

  it('does not put the lookup column back when the view switched to a layout without extra columns', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [companyColumn]);
    performViewFieldApiCreateMock.mockImplementation(async () => {
      store.set(
        recordIndexViewTypeState.atomFamily({ instanceId: RECORD_TABLE_ID }),
        ViewType.CALENDAR,
      );
      store.set(currentRecordFieldsAtom, [companyColumn]);

      return { status: 'successful' };
    });

    const { result } = renderAddHook(store);

    await act(async () => {
      await result.current.addRecordTableLookupColumn({
        relationFieldMetadataItemId: 'company-field',
        relationTargetFieldMetadataId: 'industry-field',
      });
    });

    expect(store.get(currentRecordFieldsAtom)).toEqual([companyColumn]);
  });

  it('removes the lookup column when the save fails', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [companyColumn]);
    performViewFieldApiCreateMock.mockResolvedValue({ status: 'failed' });

    const { result } = renderAddHook(store);

    await act(async () => {
      await result.current.addRecordTableLookupColumn({
        relationFieldMetadataItemId: 'company-field',
        relationTargetFieldMetadataId: 'industry-field',
      });
    });

    expect(store.get(currentRecordFieldsAtom)).toEqual([companyColumn]);
  });
});
