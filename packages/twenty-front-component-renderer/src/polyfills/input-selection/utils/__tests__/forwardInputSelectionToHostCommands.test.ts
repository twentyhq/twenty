import '@/remote/generated/remote-elements';

import { act } from 'react';

import { createRemoteTextControlRenderer } from '@/testing/createRemoteTextControlRenderer';
import { readRemoteSelectionCommands } from '@/testing/readRemoteSelectionCommands';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('forwarding input selection commands to the host', () => {
  const { renderRemoteControl, unmountRenderedRemoteControls } =
    createRemoteTextControlRenderer();

  afterEach(() => {
    jest.restoreAllMocks();
    unmountRenderedRemoteControls();
  });

  it.each(['input', 'textarea'] as const)(
    'should apply a controlled %s value before its range request in the same batch',
    (htmlTag) => {
      const { connection, hostControl, remoteControl } = renderRemoteControl({
        htmlTag,
      });

      remoteControl.setSelectionRange(8, 11, 'backward');
      remoteControl.value = 'updated text';

      act(() => connection.flush());

      expect(hostControl.value).toBe('updated text');
      expect(hostControl.selectionStart).toBe(8);
      expect(hostControl.selectionEnd).toBe(11);
      expect(hostControl.selectionDirection).toBe('backward');
      expect(remoteControl.selectionStart).toBe(8);
      expect(remoteControl.selectionEnd).toBe(11);
      expect(remoteControl.selectionDirection).toBe('backward');
    },
  );

  it('should select again after the host user moves the caret', () => {
    const { connection, hostControl, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
    });

    remoteControl.select();
    act(() => connection.flush());

    expect(hostControl.selectionStart).toBe(0);
    expect(hostControl.selectionEnd).toBe(hostControl.value.length);

    hostControl.setSelectionRange(2, 2);
    hostControl.dispatchEvent(new Event('selectionchange'));

    expect(remoteControl.selectionStart).toBe(2);

    remoteControl.select();
    act(() => connection.flush());

    expect(hostControl.selectionStart).toBe(0);
    expect(hostControl.selectionEnd).toBe(hostControl.value.length);
  });

  it('should preserve sequential selection setters in one batch', () => {
    const { connection, hostControl, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
    });

    remoteControl.selectionStart = 1;
    remoteControl.selectionEnd = 5;
    remoteControl.selectionDirection = 'backward';

    act(() => connection.flush());

    expect(hostControl.selectionStart).toBe(1);
    expect(hostControl.selectionEnd).toBe(5);
    expect(hostControl.selectionDirection).toBe('backward');
  });

  it('should retain newer commands when a previous host snapshot arrives', () => {
    const { connection, hostControl, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
    });

    remoteControl.select();
    act(() => connection.flush());
    remoteControl.setSelectionRange(2, 4);
    hostControl.dispatchEvent(new Event('selectionchange'));

    act(() => connection.flush());

    expect(hostControl.selectionStart).toBe(2);
    expect(hostControl.selectionEnd).toBe(4);
  });

  it('should convert offsets and directions the way the DOM does', () => {
    const { connection, hostControl, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
    });

    remoteControl.setSelectionRange(-1, 2);

    expect(remoteControl.selectionStart).toBe(2);
    expect(remoteControl.selectionEnd).toBe(2);

    act(() => connection.flush());

    expect(hostControl.selectionStart).toBe(2);
    expect(hostControl.selectionEnd).toBe(2);

    remoteControl.selectionStart = '3' as never;

    expect(remoteControl.selectionStart).toBe(3);

    remoteControl.selectionDirection = 'sideways' as never;

    expect(remoteControl.selectionDirection).toBe('none');

    act(() => connection.flush());

    expect(hostControl.selectionStart).toBe(3);
    expect(hostControl.selectionDirection).toBe('none');
  });

  it('should not queue selection commands for controls without selectable text', () => {
    const { connection, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
      type: 'checkbox',
      shouldReadBeforeConnect: false,
    });
    const selectHost = jest.spyOn(HTMLInputElement.prototype, 'select');
    jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(remoteControl.selectionStart).toBeNull();
    expect(remoteControl.selectionEnd).toBeNull();
    expect(remoteControl.selectionDirection).toBeNull();
    expect(() => remoteControl.setSelectionRange(0, 1)).toThrow(
      expect.objectContaining({ name: 'InvalidStateError' }),
    );
    expect(() => {
      remoteControl.selectionStart = 1;
    }).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));

    remoteControl.select();
    remoteControl.select();
    act(() => connection.flush());

    expect(readRemoteSelectionCommands(remoteControl)).toBeUndefined();

    remoteControl.setAttribute('type', 'text');
    act(() => connection.flush());

    expect(selectHost).not.toHaveBeenCalled();
  });

  it('should acknowledge commands without replaying them when the type leaves selectable text', () => {
    const { connection, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
    });
    const selectHost = jest.spyOn(HTMLInputElement.prototype, 'select');
    jest.spyOn(console, 'error').mockImplementation(() => {});

    remoteControl.select();
    remoteControl.setAttribute('type', 'checkbox');
    act(() => connection.flush());

    expect(readRemoteSelectionCommands(remoteControl)).toEqual([]);

    remoteControl.setAttribute('type', 'text');
    act(() => connection.flush());

    expect(selectHost).not.toHaveBeenCalled();
  });

  it.each(['email', 'number'])(
    'should select the text of a %s input without exposing its range',
    (type) => {
      const { connection, hostControl, remoteControl } = renderRemoteControl({
        htmlTag: 'input',
        type,
      });
      const selectHost = jest.spyOn(hostControl, 'select');

      remoteControl.select();
      act(() => connection.flush());

      expect(selectHost).toHaveBeenCalledTimes(1);
      expect(remoteControl.selectionStart).toBeNull();
      expect(() => remoteControl.setSelectionRange(0, 1)).toThrow(
        expect.objectContaining({ name: 'InvalidStateError' }),
      );
    },
  );
});
