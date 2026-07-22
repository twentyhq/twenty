import '../../utils/__tests__/setupServerRenderingGlobals';

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { type ElementRefCallback } from '@/host/types/ElementRefCallback';
import { useComposedElementRef } from '../useComposedElementRef';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const seenComposedElementRefs: (ElementRefCallback | undefined)[] = [];

const TestComponent = ({
  elementRefs,
}: {
  elementRefs: (ElementRefCallback | undefined)[];
}) => {
  const composedElementRef = useComposedElementRef(elementRefs);
  seenComposedElementRefs.push(composedElementRef);

  return createElement('div', { ref: composedElementRef });
};

describe('useComposedElementRef', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    seenComposedElementRefs.length = 0;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const renderWith = (elementRefs: (ElementRefCallback | undefined)[]) => {
    act(() => {
      root.render(createElement(TestComponent, { elementRefs }));
    });
  };

  it('should call every defined ref with the element', () => {
    const firstRef = jest.fn();
    const secondRef = jest.fn();

    renderWith([firstRef, undefined, secondRef]);

    expect(firstRef).toHaveBeenCalledTimes(1);
    expect(secondRef).toHaveBeenCalledTimes(1);
    expect(firstRef.mock.calls[0][0]).toBe(container.firstElementChild);
  });

  it('should keep the same ref identity across re-renders', () => {
    const elementRef = jest.fn();

    renderWith([elementRef]);
    renderWith([elementRef]);
    renderWith([elementRef]);

    expect(seenComposedElementRefs).toHaveLength(3);
    expect(seenComposedElementRefs[0]).toBe(seenComposedElementRefs[1]);
    expect(seenComposedElementRefs[0]).toBe(seenComposedElementRefs[2]);
    expect(elementRef).toHaveBeenCalledTimes(1);
  });

  it('should call every ref with null on unmount', () => {
    const elementRef = jest.fn();

    renderWith([elementRef]);

    act(() => {
      root.render(null);
    });

    expect(elementRef).toHaveBeenLastCalledWith(null);
  });
});
