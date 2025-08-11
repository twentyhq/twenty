import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectOptionsForTable } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForTable';
import { type FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type DropResult, type ResponderProvided } from '@hello-pangea/dnd';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

describe('useObjectOptionsForTable', () => {
  const fieldMetadataItems = [
    { id: 'id-1', name: 'field1' },
    { id: 'id-2', name: 'field2' },
    { id: 'id-3', name: 'field3' },
    { id: 'id-4', name: 'field4' },
    { id: 'id-5', name: 'field5' },
  ] as FieldMetadataItem[];

  const columnDefinitionsWithMetadata = fieldMetadataItems.map(
    (field, index) => ({
      fieldMetadataId: field.id,
      isVisible: true,
      position: index + 1,
      metadata: {
        fieldName: field.name,
      },
    }),
  );

  const renderWithRecoil = () =>
    renderHook(() => useObjectOptionsForTable('instance-id', 'object-id'), {
      wrapper: ({ children }) => (
        <RecordTableComponentInstanceContext.Provider
          value={{ instanceId: 'instance-id', onColumnsChange: jest.fn() }}
        >
          <RecoilRoot
            initializeState={({ set }) => {
              set(
                tableColumnsComponentState.atomFamily({
                  instanceId: 'instance-id',
                }),
                columnDefinitionsWithMetadata as ColumnDefinition<FieldMetadata>[],
              );
              set(objectMetadataItemsState, [
                {
                  id: 'object-id',
                  nameSingular: 'Object',
                  namePlural: 'Objects',
                  fields: fieldMetadataItems,
                  readableFields: fieldMetadataItems,
                  updatableFields: fieldMetadataItems,
                } as ObjectMetadataItem,
              ]);
            }}
          >
            {children}
          </RecoilRoot>
        </RecordTableComponentInstanceContext.Provider>
      ),
    });

  it('reorders table columns correctly', () => {
    const { result } = renderWithRecoil();

    const dropResult = {
      source: { droppableId: 'droppable', index: 2 },
      destination: { droppableId: 'droppable', index: 3 },
      draggableId: 'field2',
      type: 'TYPE',
      mode: 'FLUID',
      reason: 'DROP',
      combine: null,
    } as DropResult;

    const responderProvided = {
      announce: jest.fn(),
    } as ResponderProvided;

    act(() => {
      result.current.handleReorderColumns(dropResult, responderProvided);
    });

    expect(result.current.visibleTableColumns).toEqual([
      {
        fieldMetadataId: 'id-1',
        isVisible: true,
        metadata: {
          fieldName: 'field1',
        },
        position: 0,
      },
      {
        fieldMetadataId: 'id-3',
        isVisible: true,
        metadata: {
          fieldName: 'field3',
        },
        position: 1,
      },
      {
        fieldMetadataId: 'id-2',
        isVisible: true,
        metadata: {
          fieldName: 'field2',
        },
        position: 2,
      },
      {
        fieldMetadataId: 'id-4',
        isVisible: true,
        metadata: {
          fieldName: 'field4',
        },
        position: 3,
      },
      {
        fieldMetadataId: 'id-5',
        isVisible: true,
        metadata: {
          fieldName: 'field5',
        },
        position: 4,
      },
    ]);
  });
});
