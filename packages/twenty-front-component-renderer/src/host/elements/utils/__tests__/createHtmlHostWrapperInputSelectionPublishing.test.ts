import '@/testing/setupServerRenderingGlobals';

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';

import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('createHtmlHostWrapper input selection publishing on render', () => {
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
  });
});
