import { useObjectOptionsForTable } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForTable';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { DropResult, ResponderProvided } from '@hello-pangea/dnd';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

describe('useObjectOptionsForTable', () => {
  const initialRecoilState = [
    { fieldMetadataId: 'field1', isVisible: true, position: 0 },
    { fieldMetadataId: 'field2', isVisible: true, position: 1 },
    { fieldMetadataId: 'field3', isVisible: true, position: 2 },
    { fieldMetadataId: 'field4', isVisible: true, position: 3 },
    { fieldMetadataId: 'field5', isVisible: true, position: 4 },
  ];

  const renderWithRecoil = () =>
    renderHook(() => useObjectOptionsForTable('instance-id'), {
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
                initialRecoilState as any,
              );
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
      draggableId: 'field3',
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
        fieldMetadataId: 'field1',
        isVisible: true,
        position: 0,
      },
      {
        fieldMetadataId: 'field3',
        isVisible: true,
        position: 1,
      },
      {
        fieldMetadataId: 'field2',
        isVisible: true,
        position: 2,
      },
      {
        fieldMetadataId: 'field4',
        isVisible: true,
        position: 3,
      },
      {
        fieldMetadataId: 'field5',
        isVisible: true,
        position: 4,
      },
    ]);
  });
});
