import '@/remote/generated/remote-elements';

import { type RemoteElementSerialization } from '@remote-dom/core';
import {
  BatchingRemoteConnection,
  serializeRemoteNode,
  RemoteMutationObserver,
  type RemoteRootElement,
} from '@remote-dom/core/elements';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import {
  createRemoteComponentRenderer,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { isDefined } from 'twenty-shared/utils';

import { createHtmlHostWrapper } from '@/host/elements/utils/createHtmlHostWrapper';
import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';
import { workerInputSelectionStore } from '@/polyfills/input-selection/states/workerInputSelectionStore';
import { applySerializedEventTargetProperties } from '@/remote/elements/utils/applySerializedEventTargetProperties';
import { type InputSelectionState } from '@/types/InputSelectionState';

import { createWorkerInputSelectionStore } from '../createWorkerInputSelectionStore';
import { installInputSelectionPolyfill } from '../installInputSelectionPolyfill';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type TextControl = HTMLInputElement | HTMLTextAreaElement;

const flushRemoteMutations = async (connection: BatchingRemoteConnection) => {
  await act(async () => {
    await Promise.resolve();
    connection.flush();
  });
};

const readRemoteSelectionRequest = (remoteControl: TextControl) =>
  (serializeRemoteNode(remoteControl) as RemoteElementSerialization)
    .properties?.[INPUT_SELECTION_BRIDGE_PROPERTIES.request];

describe('forwarding input selection to the host', () => {
  const mountedRoots: Root[] = [];
  const containers: Element[] = [];
  const observers: RemoteMutationObserver[] = [];

  afterEach(() => {
    jest.restoreAllMocks();

    for (const observer of observers.splice(0)) {
      observer.disconnect();
    }

    for (const root of mountedRoots.splice(0)) {
      act(() => root.unmount());
    }

    for (const container of containers.splice(0)) {
      container.remove();
    }
  });

  const renderRemoteControl = ({
    htmlTag,
    type,
    selectionStore = workerInputSelectionStore,
    shouldReadBeforeConnect = true,
  }: {
    htmlTag: 'input' | 'textarea';
    type?: string;
    selectionStore?: ReturnType<typeof createWorkerInputSelectionStore>;
    shouldReadBeforeConnect?: boolean;
  }) => {
    const container = document.createElement('div');
    const remoteRoot = document.createElement(
      'remote-root',
    ) as RemoteRootElement;
    const remoteControl = document.createElement(
      `html-${htmlTag}`,
    ) as unknown as TextControl;
    const remoteSibling = document.createElement(
      'html-div',
    ) as unknown as HTMLElement;
    const root = createRoot(container);
    const receiver = new RemoteReceiver();
    const scheduleBatch = jest.fn();
    const connection = new BatchingRemoteConnection(receiver.connection, {
      batch: scheduleBatch,
    });
    const observer = new RemoteMutationObserver(connection);

    document.body.append(container, remoteRoot);
    mountedRoots.push(root);
    containers.push(container, remoteRoot);
    observers.push(observer);

    if (isDefined(type)) {
      remoteControl.setAttribute('type', type);
    }

    remoteControl.value = 'initial';
    remoteControl.addEventListener('change', jest.fn());
    remoteRoot.append(remoteControl, remoteSibling);
    selectionStore.setRootElement(remoteRoot);
    installInputSelectionPolyfill({
      elementPrototypes: [remoteControl],
      selectionStore,
    });

    if (shouldReadBeforeConnect) {
      selectionStore.read(remoteControl);
    }

    remoteRoot.connect(connection);
    observer.observe(remoteRoot, { initial: false });

    act(() => {
      connection.flush();
      root.render(
        <RemoteRootRenderer
          receiver={receiver}
          components={
            new Map([
              [
                `html-${htmlTag}`,
                createRemoteComponentRenderer(createHtmlHostWrapper(htmlTag)),
              ],
              [
                'html-div',
                createRemoteComponentRenderer(createHtmlHostWrapper('div')),
              ],
            ])
          }
        />,
      );
    });

    const hostControl = container.querySelector(htmlTag) as TextControl;

    scheduleBatch.mockClear();

    return {
      container,
      connection,
      hostControl,
      remoteControl,
      remoteRoot,
      remoteSibling,
      root,
      scheduleBatch,
      selectionStore,
    };
  };

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

  it('should default to the end of the value before any host snapshot', () => {
    const { remoteControl } = renderRemoteControl({
      htmlTag: 'input',
      shouldReadBeforeConnect: false,
    });

    expect(remoteControl.selectionStart).toBe(7);
    expect(remoteControl.selectionEnd).toBe(7);
    expect(remoteControl.selectionDirection).toBe('none');
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

    expect(readRemoteSelectionRequest(remoteControl)).toBeUndefined();

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

    expect(readRemoteSelectionRequest(remoteControl)).toEqual([]);

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

  it('should forward a document-level selectionchange of the focused control', () => {
    const { hostControl, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
    });

    hostControl.focus();
    hostControl.setSelectionRange(3, 6);
    document.dispatchEvent(new Event('selectionchange'));

    expect(remoteControl.selectionStart).toBe(3);
    expect(remoteControl.selectionEnd).toBe(6);
  });

  it('should keep a pending selection command when the control moves within its parent', async () => {
    const {
      connection,
      container,
      hostControl,
      remoteControl,
      remoteRoot,
      selectionStore,
    } = renderRemoteControl({ htmlTag: 'input' });
    const selectHost = jest.spyOn(hostControl, 'select');

    remoteControl.select();
    remoteControl.remove();
    selectionStore.scheduleDetachedElementSweep();
    remoteRoot.appendChild(remoteControl);

    expect(remoteControl.selectionStart).toBe(0);
    expect(remoteControl.selectionEnd).toBe(7);

    await flushRemoteMutations(connection);

    expect(container.querySelector('input')).toBe(hostControl);
    expect(selectHost).toHaveBeenCalledTimes(1);
  });

  it('should keep the selection readable while the control moves', async () => {
    const {
      connection,
      hostControl,
      remoteControl,
      remoteRoot,
      selectionStore,
    } = renderRemoteControl({ htmlTag: 'input' });

    hostControl.setSelectionRange(2, 4, 'backward');
    hostControl.dispatchEvent(new Event('selectionchange'));
    remoteControl.remove();
    selectionStore.scheduleDetachedElementSweep();
    remoteRoot.appendChild(remoteControl);

    expect(remoteControl.selectionStart).toBe(2);
    expect(remoteControl.selectionEnd).toBe(4);
    expect(remoteControl.selectionDirection).toBe('backward');

    await flushRemoteMutations(connection);

    expect(remoteControl.selectionStart).toBe(2);
    expect(remoteControl.selectionEnd).toBe(4);
    expect(remoteControl.selectionDirection).toBe('backward');
  });

  it('should ignore detached controls and controls owned by another renderer', async () => {
    const first = renderRemoteControl({ htmlTag: 'input' });
    const second = renderRemoteControl({
      htmlTag: 'textarea',
      selectionStore: createWorkerInputSelectionStore(),
    });
    const selectSecondHost = jest.spyOn(second.hostControl, 'select');
    const selectFirstHost = jest.spyOn(first.hostControl, 'select');

    first.selectionStore.request({
      element: second.remoteControl,
      request: { method: 'select' },
    });
    first.remoteControl.remove();
    first.remoteControl.select();

    await act(async () => {
      await Promise.resolve();
      first.connection.flush();
      second.connection.flush();
    });

    expect(selectFirstHost).not.toHaveBeenCalled();
    expect(selectSecondHost).not.toHaveBeenCalled();
  });

  it('should discard pending commands when the control unmounts', async () => {
    const { connection, hostControl, remoteControl, selectionStore } =
      renderRemoteControl({ htmlTag: 'input' });
    const selectHost = jest.spyOn(hostControl, 'select');

    remoteControl.select();
    remoteControl.remove();
    selectionStore.scheduleDetachedElementSweep();

    await flushRemoteMutations(connection);

    expect(selectHost).not.toHaveBeenCalled();
    expect(readRemoteSelectionRequest(remoteControl)).toEqual([]);
  });

  it('should remove host selection listeners when the renderer unmounts', () => {
    const { hostControl, remoteControl, root } = renderRemoteControl({
      htmlTag: 'input',
    });

    hostControl.setSelectionRange(1, 1);
    hostControl.dispatchEvent(new Event('selectionchange'));

    expect(remoteControl.selectionStart).toBe(1);

    act(() => root.render(null));
    hostControl.setSelectionRange(4, 4);
    hostControl.dispatchEvent(new Event('selectionchange'));

    expect(remoteControl.selectionStart).toBe(1);
  });

  it('should not replay an acknowledged command when a control is remounted', async () => {
    const {
      connection,
      hostControl,
      remoteControl,
      remoteRoot,
      selectionStore,
    } = renderRemoteControl({ htmlTag: 'input' });

    remoteControl.select();
    act(() => connection.flush());
    hostControl.setSelectionRange(2, 2);
    hostControl.dispatchEvent(new Event('selectionchange'));
    remoteControl.remove();
    selectionStore.scheduleDetachedElementSweep();

    await flushRemoteMutations(connection);

    const selectHost = jest.spyOn(HTMLInputElement.prototype, 'select');

    remoteRoot.append(remoteControl);

    await flushRemoteMutations(connection);

    expect(selectHost).not.toHaveBeenCalled();
  });

  it('should clear pending commands throughout a detached subtree before remounting', async () => {
    const {
      connection,
      remoteControl,
      remoteRoot,
      remoteSibling,
      selectionStore,
    } = renderRemoteControl({ htmlTag: 'input' });
    const selectHost = jest.spyOn(HTMLInputElement.prototype, 'select');

    remoteSibling.append(remoteControl);

    await flushRemoteMutations(connection);

    remoteControl.select();
    remoteSibling.remove();
    selectionStore.scheduleDetachedElementSweep();

    await flushRemoteMutations(connection);

    remoteRoot.append(remoteControl);

    await flushRemoteMutations(connection);

    expect(selectHost).not.toHaveBeenCalled();
  });

  it('should reject delayed snapshots from an earlier mount without requiring another selection read', async () => {
    const {
      connection,
      container,
      hostControl,
      remoteControl,
      remoteRoot,
      selectionStore,
    } = renderRemoteControl({ htmlTag: 'input' });
    const serializedControl = serializeRemoteNode(
      remoteControl,
    ) as RemoteElementSerialization;
    const deliverDelayedSnapshot = serializedControl.properties?.[
      INPUT_SELECTION_BRIDGE_PROPERTIES.update
    ] as (state: InputSelectionState) => void;

    hostControl.setSelectionRange(1, 1);
    hostControl.dispatchEvent(new Event('selectionchange'));
    remoteControl.remove();
    selectionStore.scheduleDetachedElementSweep();

    await flushRemoteMutations(connection);

    remoteRoot.append(remoteControl);

    await flushRemoteMutations(connection);

    const remountedHostControl = container.querySelector('input')!;

    remountedHostControl.setSelectionRange(4, 5, 'backward');
    remountedHostControl.dispatchEvent(new Event('selectionchange'));
    deliverDelayedSnapshot({
      selectionStart: 1,
      selectionEnd: 1,
      selectionDirection: 'none',
    });

    expect(remoteControl.selectionStart).toBe(4);
    expect(remoteControl.selectionEnd).toBe(5);
    expect(remoteControl.selectionDirection).toBe('backward');
  });
});
