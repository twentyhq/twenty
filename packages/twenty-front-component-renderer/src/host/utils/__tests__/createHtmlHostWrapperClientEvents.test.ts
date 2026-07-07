import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('createHtmlHostWrapper client events', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  it('should forward focusin through a native listener', () => {
    const onFocusin = jest.fn();
    const Wrapper = createHtmlHostWrapper('div');

    act(() => {
      root.render(createElement(Wrapper, { onFocusin }));
    });

    const node = container.firstElementChild as HTMLElement;
    act(() => {
      node.dispatchEvent(new Event('focusin', { bubbles: true }));
    });

    expect(onFocusin).toHaveBeenCalledTimes(1);
    expect(onFocusin).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'focusin' }),
    );
  });

  it('should stop forwarding focusin after the handler prop is removed', () => {
    const onFocusin = jest.fn();
    const Wrapper = createHtmlHostWrapper('div');

    act(() => {
      root.render(createElement(Wrapper, { onFocusin }));
    });

    const node = container.firstElementChild as HTMLElement;

    act(() => {
      root.render(createElement(Wrapper, {}));
    });
    act(() => {
      node.dispatchEvent(new Event('focusin', { bubbles: true }));
    });

    expect(onFocusin).not.toHaveBeenCalled();
  });

  it('should prevent default on dragover when a remote drop handler exists', () => {
    const onDrop = jest.fn();
    const Wrapper = createHtmlHostWrapper('div');

    act(() => {
      root.render(createElement(Wrapper, { onDrop }));
    });

    const node = container.firstElementChild as HTMLElement;
    const dragOverEvent = new Event('dragover', {
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      node.dispatchEvent(dragOverEvent);
    });

    expect(dragOverEvent.defaultPrevented).toBe(true);

    const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
    act(() => {
      node.dispatchEvent(dropEvent);
    });

    expect(dropEvent.defaultPrevented).toBe(true);
    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'drop' }),
    );
  });
});
