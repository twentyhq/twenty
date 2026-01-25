import { render } from '@testing-library/react';
import { act } from 'react';
import { RecoilRoot } from 'recoil';

import { type PointerEventListener } from '@/ui/utilities/pointer-event/types/PointerEventListener';
import { useDragSelect } from '@/ui/utilities/drag-select/hooks/useDragSelect';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { vi } from 'vitest';

vi.mock('../../hooks/useDragSelect');
vi.mock('../../hooks/useDragSelectWithAutoScroll', () => ({
  useDragSelectWithAutoScroll: () => ({
    handleAutoScroll: vi.fn(),
  }),
}));

vi.mock('@/ui/utilities/pointer-event/hooks/useTrackPointer', () => ({
  useTrackPointer: ({ onMouseDown }: { onMouseDown: PointerEventListener }) => {
    (window as any).trackPointerCallbacks = {
      onMouseDown,
    };
  },
}));

const mockUseDragSelect = vi.mocked(useDragSelect);

describe('DragSelect', () => {
  const mockOnDragSelectionChange = vi.fn();
  const mockSelectableContainer = document.createElement('div');
  const mockContainerRef = { current: mockSelectableContainer };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDragSelect.mockReturnValue({
      isDragSelectionStartEnabled: vi.fn().mockReturnValue(true),
      setDragSelectionStartEnabled: vi.fn(),
    });
    mockSelectableContainer.getBoundingClientRect = vi.fn().mockReturnValue({
      left: 100,
      top: 100,
      width: 500,
      height: 400,
    });
    (window as any).trackPointerCallbacks = null;
  });

  const renderDragSelect = (selectionBoundaryClass?: string) => {
    return render(
      <RecoilRoot>
        <DragSelect
          selectableItemsContainerRef={mockContainerRef}
          onDragSelectionChange={mockOnDragSelectionChange}
          selectionBoundaryClass={selectionBoundaryClass}
        />
      </RecoilRoot>,
    );
  };

  it('should not start selection when target has data-select-disable', () => {
    renderDragSelect();

    const callbacks = (window as any).trackPointerCallbacks;
    const mockTarget = document.createElement('div');
    mockTarget.dataset.selectDisable = 'true';
    mockSelectableContainer.appendChild(mockTarget);
    mockSelectableContainer.contains = vi.fn().mockReturnValue(true);

    const mockEvent = {
      target: mockTarget,
      preventDefault: vi.fn(),
    };

    act(() => {
      callbacks.onMouseDown({
        x: 150,
        y: 150,
        event: mockEvent,
      });
    });

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('should start selection and call preventDefault on regular elements', () => {
    renderDragSelect();

    const callbacks = (window as any).trackPointerCallbacks;
    const mockTarget = document.createElement('div');
    mockSelectableContainer.appendChild(mockTarget);
    mockSelectableContainer.contains = vi.fn().mockReturnValue(true);

    const mockEvent = {
      target: mockTarget,
      preventDefault: vi.fn(),
    };

    act(() => {
      callbacks.onMouseDown({
        x: 150,
        y: 150,
        event: mockEvent,
      });
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  it('should handle null container ref without crashing', () => {
    const nullRef = { current: null };

    expect(() => {
      render(
        <RecoilRoot>
          <DragSelect
            selectableItemsContainerRef={nullRef}
            onDragSelectionChange={mockOnDragSelectionChange}
          />
        </RecoilRoot>,
      );
    }).not.toThrow();
  });

  it('should use selection boundary class when provided', () => {
    const selectionBoundaryClass = 'custom-boundary';

    renderDragSelect(selectionBoundaryClass);

    const callbacks = (window as any).trackPointerCallbacks;
    const mockTarget = document.createElement('div');
    const mockBoundaryElement = document.createElement('div');
    mockBoundaryElement.className = selectionBoundaryClass;

    mockSelectableContainer.closest = vi
      .fn()
      .mockReturnValue(mockBoundaryElement);
    mockBoundaryElement.contains = vi.fn().mockReturnValue(true);

    act(() => {
      callbacks.onMouseDown({
        x: 150,
        y: 150,
        event: { target: mockTarget, preventDefault: vi.fn() },
      });
    });

    expect(mockSelectableContainer.closest).toHaveBeenCalledWith(
      `.${selectionBoundaryClass}`,
    );
  });

  it('should work without scrollWrapperComponentInstanceId (universal compatibility)', () => {
    expect(() => {
      render(
        <RecoilRoot>
          <DragSelect
            selectableItemsContainerRef={mockContainerRef}
            onDragSelectionChange={mockOnDragSelectionChange}
          />
        </RecoilRoot>,
      );
    }).not.toThrow();

    const callbacks = (window as any).trackPointerCallbacks;
    const mockTarget = document.createElement('div');
    mockSelectableContainer.appendChild(mockTarget);
    mockSelectableContainer.contains = vi.fn().mockReturnValue(true);

    expect(() => {
      act(() => {
        callbacks.onMouseDown({
          x: 150,
          y: 150,
          event: { target: mockTarget, preventDefault: vi.fn() },
        });
      });
    }).not.toThrow();
  });
});
