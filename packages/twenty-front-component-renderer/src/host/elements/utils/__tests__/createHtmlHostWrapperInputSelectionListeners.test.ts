import '@/testing/setupServerRenderingGlobals';

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';

import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('createHtmlHostWrapper input selection listeners', () => {
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
    jest.restoreAllMocks();
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
});
