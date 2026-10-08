import { REMOTE_ELEMENT_PROP } from '@remote-dom/react/host';

import { DOM_EVENT_TYPE_TO_REACT_PROP } from '@/constants/DomEventTypeToReactProp';

import { buildHostReactPropsFromRemoteProps } from '../buildHostReactPropsFromRemoteProps';

describe('buildHostReactPropsFromRemoteProps', () => {
  it('should drop internal remote-dom props', () => {
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { element: {}, receiver: {}, components: {}, id: 'keep' },
      htmlTag: 'div',
    });

    expect(result).toEqual({ id: 'keep' });
  });

  it('should drop undefined values', () => {
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { title: undefined, id: 'x' },
      htmlTag: 'div',
    });

    expect('title' in result).toBe(false);
    expect(result.id).toBe('x');
  });

  it('should parse the style string into an object', () => {
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { style: 'color: red' },
      htmlTag: 'div',
    });

    expect(result.style).toEqual({ color: 'red' });
  });

  it('should wrap function event handlers and normalize their key', () => {
    const onClick = jest.fn();
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { onClick },
      htmlTag: 'div',
    });

    expect(typeof result.onClick).toBe('function');
    expect(result.onClick).not.toBe(onClick);
  });

  it('should normalize and wrap newly allowed event handlers', () => {
    const handler = jest.fn();
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: {
        onTouchstart: handler,
        onDragstart: handler,
        onDrop: handler,
        onAnimationend: handler,
        onTransitionend: handler,
        onScrollend: handler,
        onToggle: handler,
        onLoad: handler,
      },
      htmlTag: 'div',
    });

    expect(typeof result.onTouchStart).toBe('function');
    expect(typeof result.onDragStart).toBe('function');
    expect(typeof result.onDrop).toBe('function');
    expect(typeof result.onAnimationEnd).toBe('function');
    expect(typeof result.onTransitionEnd).toBe('function');
    expect(typeof result.onScrollEnd).toBe('function');
    expect(typeof result.onToggle).toBe('function');
    expect(typeof result.onLoad).toBe('function');
  });

  it('should normalize focusin and focusout handlers to their react-style keys', () => {
    const handler = jest.fn();
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { onFocusin: handler, onFocusout: handler },
      htmlTag: 'div',
    });

    expect(typeof result.onFocusIn).toBe('function');
    expect(typeof result.onFocusOut).toBe('function');
  });

  it('should drop a handler whose remote listener the worker has removed', () => {
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: {
        onClick: jest.fn(),
        onDblclick: jest.fn(),
        [REMOTE_ELEMENT_PROP]: {
          eventListeners: { click: undefined, dblclick: jest.fn() },
        },
      },
      htmlTag: 'div',
    });

    expect(result).not.toHaveProperty('onClick');
    expect(result.onDoubleClick).toEqual(expect.any(Function));
  });

  it('should drop event-handler props whose value is not a function', () => {
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { onClick: 'alert(1)', onmouseover: 'x' },
      htmlTag: 'div',
    });

    expect('onClick' in result).toBe(false);
    expect('onMouseOver' in result).toBe(false);
    expect('onmouseover' in result).toBe(false);
  });

  it('should normalize and wrap editing and clipboard event handlers', () => {
    const handler = jest.fn();
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: {
        onBeforeinput: handler,
        onCompositionstart: handler,
        onCompositionupdate: handler,
        onCompositionend: handler,
        onCopy: handler,
        onPaste: handler,
        onCut: handler,
      },
      htmlTag: 'div',
    });

    expect(typeof result.onBeforeInput).toBe('function');
    expect(typeof result.onCompositionStart).toBe('function');
    expect(typeof result.onCompositionUpdate).toBe('function');
    expect(typeof result.onCompositionEnd).toBe('function');
    expect(typeof result.onCopy).toBe('function');
    expect(typeof result.onPaste).toBe('function');
    expect(typeof result.onCut).toBe('function');
  });

  it('should drop handler props whose event type is not allow-listed', () => {
    const handler = jest.fn();
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: {
        onSelect: handler,
        onInvalid: handler,
        onReset: handler,
        onAbort: handler,
      },
      htmlTag: 'div',
    });

    expect(result).toEqual({});
  });

  it('should keep every allow-listed event under its react prop name', () => {
    const handler = jest.fn();

    for (const reactProp of Object.values(DOM_EVENT_TYPE_TO_REACT_PROP)) {
      const result = buildHostReactPropsFromRemoteProps({
        remoteProps: { [reactProp]: handler },
        htmlTag: 'div',
      });

      expect(Object.keys(result)).toEqual([reactProp]);
    }
  });

  it('should drop capture-phase handler props', () => {
    const handler = jest.fn();
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { onClickCapture: handler, onKeyDownCapture: handler },
      htmlTag: 'div',
    });

    expect(result).toEqual({});
  });

  it('should drop a dangerous scheme on a navigation attribute', () => {
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { href: 'javascript:alert(1)' },
      htmlTag: 'a',
    });

    expect('href' in result).toBe(false);
  });

  it('should keep a dangerous scheme on a non-navigation attribute', () => {
    const dataImage = 'data:image/png;base64,iVBOR';
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { src: dataImage },
      htmlTag: 'img',
    });

    expect(result.src).toBe(dataImage);
  });

  it('should keep a safe url on a navigation attribute', () => {
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { href: 'https://twenty.com' },
      htmlTag: 'a',
    });

    expect(result.href).toBe('https://twenty.com');
  });

  it('should forward arbitrary aria-* and data-* attributes', () => {
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: {
        'aria-selected': 'true',
        'aria-activedescendant': 'item-2',
        'data-state': 'open',
        'data-count': '3',
      },
      htmlTag: 'div',
    });

    expect(result['aria-selected']).toBe('true');
    expect(result['aria-activedescendant']).toBe('item-2');
    expect(result['data-state']).toBe('open');
    expect(result['data-count']).toBe('3');
  });

  it('should forward the draggable attribute', () => {
    expect(
      buildHostReactPropsFromRemoteProps({
        remoteProps: { draggable: 'true' },
        htmlTag: 'div',
      }).draggable,
    ).toBe('true');
    expect(
      buildHostReactPropsFromRemoteProps({
        remoteProps: { draggable: true },
        htmlTag: 'div',
      }).draggable,
    ).toBe(true);
  });

  it('should still drop a non-function on* handler smuggled as a data-adjacent prop', () => {
    const result = buildHostReactPropsFromRemoteProps({
      remoteProps: { onClick: 'alert(1)', 'data-state': 'open' },
      htmlTag: 'div',
    });

    expect('onClick' in result).toBe(false);
    expect(result['data-state']).toBe('open');
  });
});
