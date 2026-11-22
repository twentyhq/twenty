import { useSaveScopedRelationColumn } from '@/object-record/record-column-scope/hooks/useSaveScopedRelationColumn';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import {
  type ViewFieldRelationScope,
  ViewSortDirection,
} from 'twenty-shared/types';

const saveViewFieldsMock = jest.fn();

jest.mock('@/views/hooks/useSaveCurrentViewFields', () => ({
  useSaveCurrentViewFields: () => ({ saveViewFields: saveViewFieldsMock }),
}));

const RECORD_TABLE_ID = 'record-table-id';
const PEOPLE_FIELD_METADATA_ITEM_ID = 'people-field';

const nameColumn: RecordField = {
  id: 'name-column',
  fieldMetadataItemId: 'name-field',
  position: 0,
  isVisible: true,
  size: 180,
};

const RELATION_SCOPE: ViewFieldRelationScope = {
  filters: [],
  filterGroups: [],
  sorts: [
    { fieldMetadataId: 'job-title-field', direction: ViewSortDirection.ASC },
  ],
  limit: 2,
};

const scopedColumn: RecordField = {
  id: 'scoped-column',
  fieldMetadataItemId: PEOPLE_FIELD_METADATA_ITEM_ID,
  position: 4,
  isVisible: true,
  isCanonical: false,
  size: 240,
  relationScope: { filters: [], filterGroups: [], sorts: [], limit: 1 },
};

const currentRecordFieldsAtom = currentRecordFieldsComponentState.atomFamily({
  instanceId: RECORD_TABLE_ID,
});

const renderSaveHook = (store: ReturnType<typeof createStore>) =>
  renderHook(() => useSaveScopedRelationColumn(RECORD_TABLE_ID), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider store={store}>{children}</JotaiProvider>
    ),
  });

describe('useSaveScopedRelationColumn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    saveViewFieldsMock.mockResolvedValue(true);
  });

  it('adds a new column after the last one once it is saved', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [nameColumn, scopedColumn]);

    const { result } = renderSaveHook(store);

    const isSaved = await act(() =>
      result.current.saveScopedRelationColumn({
        fieldMetadataItemId: PEOPLE_FIELD_METADATA_ITEM_ID,
        relationScope: RELATION_SCOPE,
      }),
    );

    expect(isSaved).toBe(true);

    const [savedViewField] = saveViewFieldsMock.mock.calls[0][0];

    expect(savedViewField).toMatchObject({
      fieldMetadataId: PEOPLE_FIELD_METADATA_ITEM_ID,
      isCanonical: false,
      isVisible: true,
      position: 5,
      relationScope: RELATION_SCOPE,
    });
    expect(store.get(currentRecordFieldsAtom)).toEqual([
      nameColumn,
      scopedColumn,
      {
        id: savedViewField.id,
        fieldMetadataItemId: PEOPLE_FIELD_METADATA_ITEM_ID,
        isCanonical: false,
        isVisible: true,
        position: 5,
        size: 100,
        relationScope: RELATION_SCOPE,
      },
    ]);
  });

  it('leaves no column behind when a new column fails to save', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [nameColumn]);
    saveViewFieldsMock.mockResolvedValue(false);

    const { result } = renderSaveHook(store);

    const isSaved = await act(() =>
      result.current.saveScopedRelationColumn({
        fieldMetadataItemId: PEOPLE_FIELD_METADATA_ITEM_ID,
        relationScope: RELATION_SCOPE,
      }),
    );

    expect(isSaved).toBe(false);
    expect(saveViewFieldsMock).toHaveBeenCalledTimes(1);
    expect(store.get(currentRecordFieldsAtom)).toEqual([nameColumn]);
  });

  it('changes only the scope of an existing column', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [nameColumn, scopedColumn]);

    const { result } = renderSaveHook(store);

    const isSaved = await act(() =>
      result.current.saveScopedRelationColumn({
        fieldMetadataItemId: PEOPLE_FIELD_METADATA_ITEM_ID,
        recordFieldId: scopedColumn.id,
        relationScope: RELATION_SCOPE,
      }),
    );

    expect(isSaved).toBe(true);
    expect(saveViewFieldsMock).toHaveBeenCalledWith([
      expect.objectContaining({
        id: scopedColumn.id,
        position: 4,
        size: 240,
        relationScope: RELATION_SCOPE,
      }),
    ]);
    expect(store.get(currentRecordFieldsAtom)).toEqual([
      nameColumn,
      { ...scopedColumn, relationScope: RELATION_SCOPE },
    ]);
  });

  it('keeps the previous scope when an existing column fails to save', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [nameColumn, scopedColumn]);
    saveViewFieldsMock.mockResolvedValue(false);

    const { result } = renderSaveHook(store);

    const isSaved = await act(() =>
      result.current.saveScopedRelationColumn({
        fieldMetadataItemId: PEOPLE_FIELD_METADATA_ITEM_ID,
        recordFieldId: scopedColumn.id,
        relationScope: RELATION_SCOPE,
      }),
    );

    expect(isSaved).toBe(false);
    expect(store.get(currentRecordFieldsAtom)).toEqual([
      nameColumn,
      scopedColumn,
    ]);
  });

  it('saves nothing for a column deleted in the meantime', async () => {
    const store = createStore();
    store.set(currentRecordFieldsAtom, [nameColumn]);

    const { result } = renderSaveHook(store);

    const isSaved = await act(() =>
      result.current.saveScopedRelationColumn({
        fieldMetadataItemId: PEOPLE_FIELD_METADATA_ITEM_ID,
        recordFieldId: scopedColumn.id,
        relationScope: RELATION_SCOPE,
      }),
    );

    expect(isSaved).toBe(false);
    expect(saveViewFieldsMock).not.toHaveBeenCalled();
    expect(store.get(currentRecordFieldsAtom)).toEqual([nameColumn]);
  });
});
