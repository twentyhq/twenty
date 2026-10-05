import '@/testing/setupServerRenderingGlobals';

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';

import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('createHtmlHostWrapper input selection', () => {
  let container: HTMLDivElement;
  let root: Root;
  let Wrapper: ReturnType<typeof createHtmlHostWrapper>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    Wrapper = createHtmlHostWrapper('input');
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const renderInput = (props: Record<string, unknown>) => {
    act(() => {
      root.render(createElement(Wrapper, props));
    });

    return container.querySelector('input') as HTMLInputElement;
  };

  it('should publish caret moves after the input switches from a non text-like type', () => {
    const onSelectionUpdate = jest.fn();

    renderInput({
      type: 'date',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    const input = renderInput({
      type: 'text',
      value: 'hello world',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    onSelectionUpdate.mockClear();

    input.setSelectionRange(2, 4);
    input.dispatchEvent(new Event('selectionchange', { bubbles: true }));

    expect(onSelectionUpdate).toHaveBeenCalledTimes(1);
    expect(onSelectionUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ selectionStart: 2, selectionEnd: 4 }),
    );
  });

  it('should publish a document selectionchange only for the focused control', () => {
    const onSelectionUpdate = jest.fn();
    const input = renderInput({
      type: 'text',
      value: 'hello world',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    onSelectionUpdate.mockClear();

    input.setSelectionRange(3, 3);
    document.dispatchEvent(new Event('selectionchange'));

    expect(onSelectionUpdate).not.toHaveBeenCalled();

    input.focus();
    onSelectionUpdate.mockClear();
    input.setSelectionRange(5, 5);
    document.dispatchEvent(new Event('selectionchange'));

    expect(onSelectionUpdate).toHaveBeenCalledTimes(1);
    expect(onSelectionUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ selectionStart: 5, selectionEnd: 5 }),
    );
  });

  it('should publish a bubbling element selectionchange once', () => {
    const onSelectionUpdate = jest.fn();
    const input = renderInput({
      type: 'text',
      value: 'hello world',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    input.focus();
    onSelectionUpdate.mockClear();

    input.setSelectionRange(1, 2);
    input.dispatchEvent(new Event('selectionchange', { bubbles: true }));

    expect(onSelectionUpdate).toHaveBeenCalledTimes(1);
  });

  it('should remove its document selectionchange listener on unmount', () => {
    const addDocumentListener = jest.spyOn(document, 'addEventListener');
    const removeDocumentListener = jest.spyOn(document, 'removeEventListener');

    renderInput({
      type: 'text',
      value: 'hello world',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: jest.fn(),
    });
    const documentSelectionChangeListeners = addDocumentListener.mock.calls
      .filter(([eventType]) => eventType === 'selectionchange')
      .map(([, listener]) => listener);

    act(() => {
      root.render(null);
    });

    expect(documentSelectionChangeListeners).toHaveLength(1);
    expect(removeDocumentListener).toHaveBeenCalledWith(
      'selectionchange',
      documentSelectionChangeListeners[0],
    );

    addDocumentListener.mockRestore();
    removeDocumentListener.mockRestore();
  });

  it('should stop publishing once the caret ref detaches', () => {
    const onSelectionUpdate = jest.fn();
    const input = renderInput({
      type: 'text',
      value: 'hello world',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    renderInput({
      type: 'date',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    input.focus();
    onSelectionUpdate.mockClear();

    document.dispatchEvent(new Event('selectionchange'));
    input.dispatchEvent(new Event('selectionchange', { bubbles: true }));

    expect(onSelectionUpdate).not.toHaveBeenCalled();
  });

  it('should not republish an unchanged selection when the host re-renders', () => {
    const onSelectionUpdate = jest.fn();

    renderInput({
      type: 'text',
      value: 'hello',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    renderInput({
      type: 'text',
      value: 'hello',
      placeholder: 'first',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    renderInput({
      type: 'text',
      value: 'hello',
      placeholder: 'second',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });

    expect(onSelectionUpdate).toHaveBeenCalledTimes(1);
  });

  it('should republish when a command is acknowledged without moving the selection', () => {
    const onSelectionUpdate = jest.fn();

    renderInput({
      type: 'text',
      value: 'hello',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    onSelectionUpdate.mockClear();
    renderInput({
      type: 'text',
      value: 'hello',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.request]: [
        {
          sequence: 1,
          request: {
            method: 'setSelectionRange',
            start: 5,
            end: 5,
            direction: 'none',
          },
        },
      ],
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });

    expect(onSelectionUpdate).toHaveBeenCalledTimes(1);
    expect(onSelectionUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectionStart: 5,
        selectionEnd: 5,
        selectionCommandSequence: 1,
      }),
    );

    renderInput({
      type: 'text',
      value: 'hello',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.request]: [],
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });

    expect(onSelectionUpdate).toHaveBeenCalledTimes(1);
  });

  it('should republish an unchanged selection to a new subscriber', () => {
    const onSelectionUpdate = jest.fn();
    const nextOnSelectionUpdate = jest.fn();

    renderInput({
      type: 'text',
      value: 'hello',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    renderInput({
      type: 'text',
      value: 'hello',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: nextOnSelectionUpdate,
    });

    expect(onSelectionUpdate).toHaveBeenCalledTimes(1);
    expect(nextOnSelectionUpdate).toHaveBeenCalledTimes(1);
  });

  it('should republish a focused value write that keeps the caret', () => {
    const onSelectionUpdate = jest.fn();
    const input = renderInput({
      type: 'text',
      value: 'hello',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    input.focus();
    input.setSelectionRange(2, 2);
    input.dispatchEvent(new Event('selectionchange', { bubbles: true }));
    onSelectionUpdate.mockClear();

    renderInput({
      type: 'text',
      value: 'HELLO',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });

    expect(input.value).toBe('HELLO');
    expect(onSelectionUpdate).toHaveBeenCalledTimes(1);
    expect(onSelectionUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ selectionStart: 2, selectionEnd: 2 }),
    );
  });

  it('should publish every selectionchange even when the selection is unchanged', () => {
    const onSelectionUpdate = jest.fn();
    const input = renderInput({
      type: 'text',
      value: 'hello',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    onSelectionUpdate.mockClear();

    input.dispatchEvent(new Event('selectionchange', { bubbles: true }));

    expect(onSelectionUpdate).toHaveBeenCalledTimes(1);
  });

  it('should not publish on input events', () => {
    const onSelectionUpdate = jest.fn();
    const input = renderInput({
      type: 'text',
      value: 'hello',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });
    onSelectionUpdate.mockClear();

    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(onSelectionUpdate).not.toHaveBeenCalled();
  });

  it('should acknowledge commands while the input renders without a caret ref', () => {
    const onSelectionUpdate = jest.fn();
    const select = jest.spyOn(HTMLInputElement.prototype, 'select');

    renderInput({
      type: 'checkbox',
      [INPUT_SELECTION_BRIDGE_PROPERTIES.request]: [
        { sequence: 3, request: { method: 'select' } },
      ],
      [INPUT_SELECTION_BRIDGE_PROPERTIES.update]: onSelectionUpdate,
    });

    expect(select).not.toHaveBeenCalled();
    expect(onSelectionUpdate).toHaveBeenCalledWith({
      selectionStart: null,
      selectionEnd: null,
      selectionDirection: null,
      selectionCommandSequence: 3,
    });

    select.mockRestore();
  });
});
