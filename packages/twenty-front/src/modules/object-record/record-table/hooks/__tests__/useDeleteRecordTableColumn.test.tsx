import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useDeleteRecordTableColumn } from '@/object-record/record-table/hooks/useDeleteRecordTableColumn';
import { ViewType } from '@/views/types/ViewType';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const performViewFieldApiDestroyMock = jest.fn();

jest.mock('@/views/hooks/internal/usePerformViewFieldApiPersist', () => ({
  usePerformViewFieldApiPersist: () => ({
    performViewFieldApiDestroy: performViewFieldApiDestroyMock,
  }),
}));

const mockCanPersistChanges = jest.fn(() => true);

jest.mock('@/views/hooks/useCanPersistViewChanges', () => ({
  useCanPersistViewChanges: () => ({
    canPersistChanges: mockCanPersistChanges(),
  }),
}));

const RECORD_TABLE_ID = 'record-table-id';

const buildRecordField = ({
  id,
  position,
}: {
  id: string;
  position: number;
}): RecordField => ({
  id,
  fieldMetadataItemId: `field-${id}`,
  position,
  isVisible: true,
  size: 100,
});

const nameColumn = buildRecordField({ id: 'name-column', position: 0 });
const extraColumn = buildRecordField({ id: 'extra-column', position: 1 });

const currentRecordFieldsAtom = currentRecordFieldsComponentState.atomFamily({
  instanceId: RECORD_TABLE_ID,
});

const renderDeleteHook = (store: ReturnType<typeof createStore>) =>
  renderHook(() => useDeleteRecordTableColumn(RECORD_TABLE_ID), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

describe('useDeleteRecordTableColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanPersistChanges.mockReturnValue(true);
  });

  it('leaves the column in place when the view cannot be changed', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [nameColumn, extraColumn]);
    mockCanPersistChanges.mockReturnValue(false);

    const { result } = renderDeleteHook(store);

    const isDeleted = await act(() =>
      result.current.deleteRecordTableColumn(extraColumn.id),
    );

    expect(isDeleted).toBe(false);
    expect(store.get(currentRecordFieldsAtom)).toEqual([
      nameColumn,
      extraColumn,
    ]);
    expect(performViewFieldApiDestroyMock).not.toHaveBeenCalled();
  });

  it('keeps the column removed when a view field sync brings it back while the delete is pending', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [nameColumn, extraColumn]);
    performViewFieldApiDestroyMock.mockImplementation(async () => {
      store.set(currentRecordFieldsAtom, [nameColumn, extraColumn]);

      return { status: 'successful' };
    });

    const { result } = renderDeleteHook(store);

    const isDeleted = await act(() =>
      result.current.deleteRecordTableColumn(extraColumn.id),
    );

    expect(isDeleted).toBe(true);
    expect(performViewFieldApiDestroyMock).toHaveBeenCalledTimes(1);
    expect(performViewFieldApiDestroyMock).toHaveBeenCalledWith([
      { input: { id: extraColumn.id } },
    ]);
    expect(store.get(currentRecordFieldsAtom)).toEqual([nameColumn]);
  });

  it('puts the column back at its position when the delete fails', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [nameColumn, extraColumn]);
    performViewFieldApiDestroyMock.mockResolvedValue({ status: 'failed' });

    const { result } = renderDeleteHook(store);

    await act(async () => {
      await result.current.deleteRecordTableColumn(extraColumn.id);
    });

    expect(performViewFieldApiDestroyMock).toHaveBeenCalledTimes(1);
    expect(store.get(currentRecordFieldsAtom)).toEqual([
      nameColumn,
      extraColumn,
    ]);
  });

  it('does not put an extra column back when the view switched to a layout without extra columns', async () => {
    const store = createStore();
    const nonCanonicalColumn = { ...extraColumn, isCanonical: false };
    store.set(currentRecordFieldsAtom, [nameColumn, nonCanonicalColumn]);
    performViewFieldApiDestroyMock.mockImplementation(async () => {
      store.set(
        recordIndexViewTypeState.atomFamily({ instanceId: RECORD_TABLE_ID }),
        ViewType.CALENDAR,
      );

      return { status: 'failed' };
    });

    const { result } = renderDeleteHook(store);

    await act(async () => {
      await result.current.deleteRecordTableColumn(nonCanonicalColumn.id);
    });

    expect(store.get(currentRecordFieldsAtom)).toEqual([nameColumn]);
  });
});
