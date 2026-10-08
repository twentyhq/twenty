import '@/remote/generated/remote-elements';

import { act } from 'react';

import { applySerializedEventTargetProperties } from '@/remote/elements/utils/applySerializedEventTargetProperties';
import { createRemoteTextControlRenderer } from '@/testing/createRemoteTextControlRenderer';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('reading forwarded input selection in the worker', () => {
  const { renderRemoteControl, unmountRenderedRemoteControls } =
    createRemoteTextControlRenderer();

  afterEach(() => {
    jest.restoreAllMocks();
    unmountRenderedRemoteControls();
  });

  it('should publish host and form event snapshots without echoing selection commands', () => {
    const { connection, hostControl, remoteControl, scheduleBatch } =
      renderRemoteControl({ htmlTag: 'textarea' });
    const setHostSelection = jest.spyOn(hostControl, 'setSelectionRange');

    hostControl.setSelectionRange(1, 5, 'backward');
    hostControl.dispatchEvent(new Event('selectionchange'));

    expect(remoteControl.selectionStart).toBe(1);
    expect(remoteControl.selectionEnd).toBe(5);
    expect(remoteControl.selectionDirection).toBe('backward');

    setHostSelection.mockClear();
    applySerializedEventTargetProperties({
      element: remoteControl,
      eventData: {
        type: 'input',
        selectionStart: 3,
        selectionEnd: 4,
        selectionDirection: 'forward',
      },
    });

    expect(remoteControl.selectionStart).toBe(3);
    expect(remoteControl.selectionEnd).toBe(4);
    expect(remoteControl.selectionDirection).toBe('forward');
    expect(scheduleBatch).not.toHaveBeenCalled();

    act(() => connection.flush());

    expect(setHostSelection).not.toHaveBeenCalled();
  });

  it('should read its own writes before the host acknowledges them', () => {
    const { connection, hostControl, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
    });

    remoteControl.setSelectionRange(2, 4, 'backward');

    expect(remoteControl.selectionStart).toBe(2);
    expect(remoteControl.selectionEnd).toBe(4);
    expect(remoteControl.selectionDirection).toBe('backward');

    remoteControl.selectionStart = 5;

    expect(remoteControl.selectionStart).toBe(5);
    expect(remoteControl.selectionEnd).toBe(5);
    expect(remoteControl.selectionDirection).toBe('backward');

    remoteControl.setSelectionRange(3, 100);

    expect(remoteControl.selectionStart).toBe(3);
    expect(remoteControl.selectionEnd).toBe(7);
    expect(remoteControl.selectionDirection).toBe('none');

    remoteControl.select();

    expect(remoteControl.selectionStart).toBe(0);
    expect(remoteControl.selectionEnd).toBe(7);

    act(() => connection.flush());

    expect(hostControl.selectionStart).toBe(0);
    expect(hostControl.selectionEnd).toBe(7);
    expect(remoteControl.selectionStart).toBe(0);
    expect(remoteControl.selectionEnd).toBe(7);
  });

  it('should keep an optimistic write when a stale event snapshot arrives', () => {
    const { connection, hostControl, remoteControl, selectionStore } =
      renderRemoteControl({ htmlTag: 'input' });

    remoteControl.setSelectionRange(2, 4);
    selectionStore.applySnapshot({
      element: remoteControl,
      state: { selectionStart: 6, selectionEnd: 6, selectionDirection: 'none' },
    });

    expect(remoteControl.selectionStart).toBe(2);
    expect(remoteControl.selectionEnd).toBe(4);

    act(() => connection.flush());
    hostControl.setSelectionRange(6, 6);
    hostControl.dispatchEvent(new Event('selectionchange'));

    expect(remoteControl.selectionStart).toBe(6);
    expect(remoteControl.selectionEnd).toBe(6);
  });

  it('should read its own writes on an input whose value is a number', () => {
    const { remoteControl } = renderRemoteControl({
      htmlTag: 'input',
      shouldReadBeforeConnect: false,
    });

    (remoteControl as unknown as { value: unknown }).value = 1234567;

    expect(remoteControl.selectionStart).toBe(7);
    expect(remoteControl.selectionEnd).toBe(7);

    remoteControl.setSelectionRange(1, 3, 'backward');

    expect(remoteControl.selectionStart).toBe(1);
    expect(remoteControl.selectionEnd).toBe(3);
    expect(remoteControl.selectionDirection).toBe('backward');
  });
});
