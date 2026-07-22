import { DOM_EVENT_TYPE_TO_REACT_PROP } from '@/constants/DomEventTypeToReactProp';

import { buildHostReactPropsFromRemoteProps } from '../buildHostReactPropsFromRemoteProps';

describe('buildHostReactPropsFromRemoteProps', () => {
  it('should drop internal remote-dom props', () => {
    const result = buildHostReactPropsFromRemoteProps(
      { element: {}, receiver: {}, components: {}, id: 'keep' },
      'div',
    );

    expect(result).toEqual({ id: 'keep' });
  });

  it('should drop undefined values', () => {
    const result = buildHostReactPropsFromRemoteProps(
      { title: undefined, id: 'x' },
      'div',
    );

    expect('title' in result).toBe(false);
    expect(result.id).toBe('x');
  });

  it('should parse the style string into an object', () => {
    const result = buildHostReactPropsFromRemoteProps(
      { style: 'color: red' },
      'div',
    );

    expect(result.style).toEqual({ color: 'red' });
  });

  it('should wrap function event handlers and normalize their key', () => {
    const onClick = jest.fn();
    const result = buildHostReactPropsFromRemoteProps({ onClick }, 'div');

    expect(typeof result.onClick).toBe('function');
    expect(result.onClick).not.toBe(onClick);
  });

  it('should normalize and wrap newly allowed event handlers', () => {
    const handler = jest.fn();
    const result = buildHostReactPropsFromRemoteProps(
      {
        onTouchstart: handler,
        onDragstart: handler,
        onDrop: handler,
        onAnimationend: handler,
        onTransitionend: handler,
        onScrollend: handler,
        onToggle: handler,
        onLoad: handler,
      },
      'div',
    );

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
    const result = buildHostReactPropsFromRemoteProps(
      { onFocusin: handler, onFocusout: handler },
      'div',
    );

    expect(typeof result.onFocusIn).toBe('function');
    expect(typeof result.onFocusOut).toBe('function');
  });

  it('should drop event-handler props whose value is not a function', () => {
    const result = buildHostReactPropsFromRemoteProps(
      { onClick: 'alert(1)', onmouseover: 'x' },
      'div',
    );

    expect('onClick' in result).toBe(false);
    expect('onMouseOver' in result).toBe(false);
    expect('onmouseover' in result).toBe(false);
  });

  it('should normalize and wrap editing and clipboard event handlers', () => {
    const handler = jest.fn();
    const result = buildHostReactPropsFromRemoteProps(
      {
        onBeforeinput: handler,
        onCompositionstart: handler,
        onCompositionupdate: handler,
        onCompositionend: handler,
        onCopy: handler,
        onPaste: handler,
        onCut: handler,
      },
      'div',
    );

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
    const result = buildHostReactPropsFromRemoteProps(
      {
        onSelect: handler,
        onInvalid: handler,
        onReset: handler,
        onAbort: handler,
      },
      'div',
    );

    expect(result).toEqual({});
  });

  it('should keep every allow-listed event under its react prop name', () => {
    const handler = jest.fn();

    for (const reactProp of Object.values(DOM_EVENT_TYPE_TO_REACT_PROP)) {
      const result = buildHostReactPropsFromRemoteProps(
        { [reactProp]: handler },
        'div',
      );

      expect(Object.keys(result)).toEqual([reactProp]);
    }
  });

  it('should drop capture-phase handler props', () => {
    const handler = jest.fn();
    const result = buildHostReactPropsFromRemoteProps(
      { onClickCapture: handler, onKeyDownCapture: handler },
      'div',
    );

    expect(result).toEqual({});
  });

  it('should drop a dangerous scheme on a navigation attribute', () => {
    const result = buildHostReactPropsFromRemoteProps(
      { href: 'javascript:alert(1)' },
      'a',
    );

    expect('href' in result).toBe(false);
  });

  it('should keep a dangerous scheme on a non-navigation attribute', () => {
    const dataImage = 'data:image/png;base64,iVBOR';
    const result = buildHostReactPropsFromRemoteProps(
      { src: dataImage },
      'img',
    );

    expect(result.src).toBe(dataImage);
  });

  it('should keep a safe url on a navigation attribute', () => {
    const result = buildHostReactPropsFromRemoteProps(
      { href: 'https://twenty.com' },
      'a',
    );

    expect(result.href).toBe('https://twenty.com');
  });

  it('should forward arbitrary aria-* and data-* attributes', () => {
    const result = buildHostReactPropsFromRemoteProps(
      {
        'aria-selected': 'true',
        'aria-activedescendant': 'item-2',
        'data-state': 'open',
        'data-count': '3',
      },
      'div',
    );

    expect(result['aria-selected']).toBe('true');
    expect(result['aria-activedescendant']).toBe('item-2');
    expect(result['data-state']).toBe('open');
    expect(result['data-count']).toBe('3');
  });

  it('should forward the draggable attribute', () => {
    expect(
      buildHostReactPropsFromRemoteProps({ draggable: 'true' }, 'div')
        .draggable,
    ).toBe('true');
    expect(
      buildHostReactPropsFromRemoteProps({ draggable: true }, 'div').draggable,
    ).toBe(true);
  });

  it('should still drop a non-function on* handler smuggled as a data-adjacent prop', () => {
    const result = buildHostReactPropsFromRemoteProps(
      { onClick: 'alert(1)', 'data-state': 'open' },
      'div',
    );

    expect('onClick' in result).toBe(false);
    expect(result['data-state']).toBe('open');
  });
});
