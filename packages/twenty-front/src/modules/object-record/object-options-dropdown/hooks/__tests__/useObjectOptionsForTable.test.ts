import { useObjectOptionsForTable } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForTable';
import { DropResult, ResponderProvided } from '@hello-pangea/dnd';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

// Mock the dependencies
jest.mock('@/object-record/record-table/hooks/useTableColumns', () => ({
  useTableColumns: jest.fn(() => ({
    handleColumnVisibilityChange: jest.fn(),
    handleColumnReorder: jest.fn(),
  })),
}));

describe('useObjectOptionsForTable', () => {
  const renderWithRecoil = () =>
    renderHook(() => useObjectOptionsForTable('tableId'), {
      wrapper: RecoilRoot,
    });

  it('reorders table columns correctly', () => {
    const { result } = renderWithRecoil();

    const dropResult = {
      source: { droppableId: 'droppable', index: 0 },
      destination: { droppableId: 'droppable', index: 1 },
      draggableId: 'column1',
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

    expect(result.current.visibleTableColumns).toBeDefined();
  });

  it('handles visibility changes correctly', () => {
    const { result } = renderWithRecoil();

    act(() => {
      result.current.handleColumnVisibilityChange({
        id: 'column1',
      } as any);
    });

    expect(result.current.hiddenTableColumns).toBeDefined();
  });
});
