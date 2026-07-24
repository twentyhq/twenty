import './setupServerRenderingGlobals';

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { useCaretPreservingElementRef } from '@/host/hooks/useCaretPreservingElementRef';
import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

jest.mock('@/host/hooks/useCaretPreservingElementRef', () => ({
  useCaretPreservingElementRef: jest.fn(() => () => {}),
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('createHtmlHostWrapper caret hook scope', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const renderWrapper = (htmlTag: string, props: Record<string, unknown>) => {
    act(() => {
      root.render(createElement(createHtmlHostWrapper(htmlTag), props));
    });
  };

  it('should not call the caret hook for a non editable tag', () => {
    renderWrapper('div', {});

    expect(useCaretPreservingElementRef).not.toHaveBeenCalled();
  });

  it('should not call the caret hook for a span', () => {
    renderWrapper('span', {});

    expect(useCaretPreservingElementRef).not.toHaveBeenCalled();
  });

  it('should call the caret hook for a text input', () => {
    renderWrapper('input', { type: 'text' });

    expect(useCaretPreservingElementRef).toHaveBeenCalled();
  });

  it('should call the caret hook for a textarea', () => {
    renderWrapper('textarea', {});

    expect(useCaretPreservingElementRef).toHaveBeenCalled();
  });

  it('should keep rendering a plain input element for a checkbox', () => {
    renderWrapper('input', { type: 'checkbox' });

    expect(container.firstElementChild?.tagName).toBe('INPUT');
  });
});
