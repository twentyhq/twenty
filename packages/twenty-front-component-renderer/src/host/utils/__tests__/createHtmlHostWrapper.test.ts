import './setupServerRenderingGlobals';

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';

import { FrontComponentExternalNavigationContext } from '@/host/contexts/FrontComponentExternalNavigationContext';

import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const renderWrapper = (
  htmlTag: string,
  props: Record<string, unknown>,
  children?: string,
): string =>
  renderToStaticMarkup(
    createElement(createHtmlHostWrapper(htmlTag), props, children),
  );

describe('createHtmlHostWrapper prop hardening', () => {
  it('should drop an on* attribute whose value is not a function', () => {
    const markup = renderWrapper('div', { onmouseover: 'alert(1)' });

    expect(markup).not.toContain('onmouseover');
    expect(markup).not.toContain('alert(1)');
  });

  it('should drop a normalized event attribute whose value is not a function', () => {
    const markup = renderWrapper('div', { onClick: 'alert(1)' });

    expect(markup).not.toContain('alert(1)');
  });

  it('should drop a javascript: url on href', () => {
    const markup = renderWrapper('a', { href: 'javascript:alert(1)' }, 'link');

    expect(markup).not.toContain('javascript:');
  });

  it('should drop a data: url on href', () => {
    const markup = renderWrapper(
      'a',
      { href: 'data:text/html,<script>alert(1)</script>' },
      'link',
    );

    expect(markup).not.toContain('data:');
  });

  it('should drop a vbscript: url on href', () => {
    const markup = renderWrapper('a', { href: 'vbscript:msgbox(1)' }, 'link');

    expect(markup).not.toContain('vbscript:');
  });

  it('should drop a javascript: url on an anchor xlink:href', () => {
    const markup = renderWrapper(
      'a',
      { 'xlink:href': 'javascript:alert(1)' },
      'link',
    );

    expect(markup).not.toContain('javascript:');
  });

  it('should drop a javascript: url on a React-style anchor xlinkHref', () => {
    const markup = renderWrapper(
      'a',
      { xlinkHref: 'javascript:alert(1)' },
      'link',
    );

    expect(markup).not.toContain('javascript:');
  });

  it('should drop a javascript: url obfuscated with control characters', () => {
    const markup = renderWrapper(
      'a',
      { href: 'java\tscript:alert(1)' },
      'link',
    );

    expect(markup).not.toContain('script:');
  });

  it('should keep a safe href', () => {
    const markup = renderWrapper('a', { href: 'https://twenty.com' }, 'link');

    expect(markup).toContain('href="https://twenty.com"');
  });

  it('should keep a data: image on src', () => {
    const dataImageUrl = 'data:image/png;base64,iVBORw0KGgo=';
    const markup = renderWrapper('img', { src: dataImageUrl });

    expect(markup).toContain(dataImageUrl);
  });
});

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
    const handleFocusIn = jest.fn();
    const Wrapper = createHtmlHostWrapper('div');

    act(() => {
      root.render(createElement(Wrapper, { onFocusin: handleFocusIn }));
    });

    const node = container.firstElementChild as HTMLElement;
    act(() => {
      node.dispatchEvent(new Event('focusin', { bubbles: true }));
    });

    expect(handleFocusIn).toHaveBeenCalledTimes(1);
    expect(handleFocusIn).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'focusin' }),
    );
  });

  it('should re-assert an unchanged controlled value on an unrelated re-render', () => {
    const Wrapper = createHtmlHostWrapper('input');

    act(() => {
      root.render(createElement(Wrapper, { type: 'text', value: 'fixed' }));
    });

    const node = container.firstElementChild as HTMLInputElement;
    node.value = 'fixed-typed';

    act(() => {
      root.render(
        createElement(Wrapper, {
          type: 'text',
          value: 'fixed',
          className: 'rerendered',
        }),
      );
    });

    expect(node.value).toBe('fixed');
  });

  it('should clear the host input when a controlled value becomes empty', () => {
    const Wrapper = createHtmlHostWrapper('input');

    act(() => {
      root.render(createElement(Wrapper, { type: 'text', value: 'abc' }));
    });

    const node = container.firstElementChild as HTMLInputElement;
    expect(node.value).toBe('abc');

    act(() => {
      root.render(createElement(Wrapper, { type: 'text', value: '' }));
    });

    expect(node.value).toBe('');
  });

  it('should stop forwarding focusin after the handler prop is removed', () => {
    const handleFocusIn = jest.fn();
    const Wrapper = createHtmlHostWrapper('div');

    act(() => {
      root.render(createElement(Wrapper, { onFocusin: handleFocusIn }));
    });

    const node = container.firstElementChild as HTMLElement;

    act(() => {
      root.render(createElement(Wrapper, {}));
    });
    act(() => {
      node.dispatchEvent(new Event('focusin', { bubbles: true }));
    });

    expect(handleFocusIn).not.toHaveBeenCalled();
  });

  it('should forward beforeinput on a text input through a native listener', () => {
    const handleBeforeInput = jest.fn();
    const Wrapper = createHtmlHostWrapper('input');

    act(() => {
      root.render(
        createElement(Wrapper, {
          onBeforeinput: handleBeforeInput,
          type: 'text',
        }),
      );
    });

    const node = container.firstElementChild as HTMLInputElement;
    act(() => {
      node.dispatchEvent(
        new InputEvent('beforeinput', {
          bubbles: true,
          inputType: 'insertText',
          data: 'a',
        }),
      );
    });

    expect(handleBeforeInput).toHaveBeenCalledTimes(1);
    expect(handleBeforeInput).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'beforeinput',
        inputType: 'insertText',
        data: 'a',
      }),
    );
  });

  it('should prevent default on dragover when a remote drop handler exists', () => {
    const handleDrop = jest.fn();
    const Wrapper = createHtmlHostWrapper('div');

    act(() => {
      root.render(createElement(Wrapper, { onDrop: handleDrop }));
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
    expect(handleDrop).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'drop' }),
    );
  });
});

describe('createHtmlHostWrapper anchor navigation', () => {
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

  const renderAnchor = (
    props: Record<string, unknown>,
    requestExternalNavigation: ((request: unknown) => void) | null,
  ) => {
    const Wrapper = createHtmlHostWrapper('a');

    act(() => {
      root.render(
        createElement(
          FrontComponentExternalNavigationContext.Provider,
          { value: requestExternalNavigation },
          createElement(Wrapper, props, 'link'),
        ),
      );
    });

    return container.querySelector('a') as HTMLAnchorElement;
  };

  const clickAnchor = (anchor: HTMLAnchorElement): MouseEvent => {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
    });

    act(() => {
      anchor.dispatchEvent(clickEvent);
    });

    return clickEvent;
  };

  it('should prevent default and request navigation for an external anchor click', () => {
    const requestExternalNavigation = jest.fn();
    const remoteOnClick = jest.fn();

    const anchor = renderAnchor(
      { href: 'https://example.com/probe', onClick: remoteOnClick },
      requestExternalNavigation,
    );

    const clickEvent = clickAnchor(anchor);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(requestExternalNavigation).toHaveBeenCalledWith({
      url: 'https://example.com/probe',
      target: undefined,
    });
    expect(remoteOnClick).not.toHaveBeenCalled();
  });

  it('should not request navigation for a same-origin anchor click', () => {
    const requestExternalNavigation = jest.fn();

    const anchor = renderAnchor(
      { href: 'http://localhost/objects/people' },
      requestExternalNavigation,
    );

    const clickEvent = clickAnchor(anchor);

    expect(clickEvent.defaultPrevented).toBe(false);
    expect(requestExternalNavigation).not.toHaveBeenCalled();
  });
});
