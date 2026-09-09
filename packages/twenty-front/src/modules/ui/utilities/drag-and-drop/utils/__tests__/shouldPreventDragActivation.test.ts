import { shouldPreventDragActivation } from '@/ui/utilities/drag-and-drop/utils/shouldPreventDragActivation';

const createPointerEvent = (target: Element) =>
  ({ target }) as unknown as PointerEvent;

describe('shouldPreventDragActivation', () => {
  it('should prevent activation when the target opts out of dragging', () => {
    const sourceElement = document.createElement('div');
    const resizeHandle = document.createElement('div');
    resizeHandle.setAttribute('data-dnd-drag-disable', '');
    sourceElement.appendChild(resizeHandle);

    expect(
      shouldPreventDragActivation(createPointerEvent(resizeHandle), {
        element: sourceElement,
      }),
    ).toBe(true);
  });

  it('should prevent activation when the target is inside an element that opts out of dragging', () => {
    const sourceElement = document.createElement('div');
    const optedOutContainer = document.createElement('div');
    optedOutContainer.setAttribute('data-dnd-drag-disable', '');
    const nestedTarget = document.createElement('span');
    optedOutContainer.appendChild(nestedTarget);
    sourceElement.appendChild(optedOutContainer);

    expect(
      shouldPreventDragActivation(createPointerEvent(nestedTarget), {
        element: sourceElement,
      }),
    ).toBe(true);
  });

  it('should not prevent activation when the target is the source element', () => {
    const sourceElement = document.createElement('div');

    expect(
      shouldPreventDragActivation(createPointerEvent(sourceElement), {
        element: sourceElement,
      }),
    ).toBe(false);
  });

  it('should not prevent activation for a plain descendant of the source element', () => {
    const sourceElement = document.createElement('div');
    const plainDescendant = document.createElement('span');
    sourceElement.appendChild(plainDescendant);

    expect(
      shouldPreventDragActivation(createPointerEvent(plainDescendant), {
        element: sourceElement,
      }),
    ).toBe(false);
  });
});
