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
    selectionStore = workerInputSelectionStore,
  }: {
    htmlTag: 'input' | 'textarea';
    selectionStore?: ReturnType<typeof createWorkerInputSelectionStore>;
  }) => {
    const container = document.createElement('div');
    const remoteRoot = document.createElement(
      'remote-root',
    ) as RemoteRootElement;
    const remoteControl = document.createElement(
      `html-${htmlTag}`,
    ) as unknown as TextControl;
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
    remoteControl.value = 'initial';
    remoteControl.addEventListener('change', jest.fn());
    remoteRoot.append(remoteControl);
    selectionStore.setRootElement(remoteRoot);
    installInputSelectionPolyfill({
      elementPrototypes: [remoteControl],
      selectionStore,
    });
    selectionStore.read(remoteControl);
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
    hostControl.dispatchEvent(new Event('select'));

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
    const { connection, hostControl, remoteControl } = renderRemoteControl({
      htmlTag: 'input',
    });
    const selectHost = jest.spyOn(hostControl, 'select');

    remoteControl.select();
    remoteControl.remove();

    await act(async () => {
      await Promise.resolve();
      connection.flush();
    });

    expect(selectHost).not.toHaveBeenCalled();
  });

  it('should remove host selection listeners when the renderer unmounts', () => {
    const { hostControl, remoteControl, root } = renderRemoteControl({
      htmlTag: 'input',
    });

    hostControl.setSelectionRange(1, 1);
    hostControl.dispatchEvent(new Event('select'));

    expect(remoteControl.selectionStart).toBe(1);

    act(() => root.render(null));
    hostControl.setSelectionRange(4, 4);
    hostControl.dispatchEvent(new Event('select'));
    hostControl.dispatchEvent(new Event('selectionchange'));
    hostControl.dispatchEvent(new Event('input'));

    expect(remoteControl.selectionStart).toBe(1);
  });

  it('should not replay an acknowledged command when a control is remounted', async () => {
    const { connection, hostControl, remoteControl, remoteRoot } =
      renderRemoteControl({ htmlTag: 'input' });

    remoteControl.select();
    act(() => connection.flush());
    hostControl.setSelectionRange(2, 2);
    hostControl.dispatchEvent(new Event('select'));
    remoteControl.remove();

    await act(async () => {
      await Promise.resolve();
      connection.flush();
    });

    const selectHost = jest.spyOn(HTMLInputElement.prototype, 'select');

    remoteRoot.append(remoteControl);

    await act(async () => {
      await Promise.resolve();
      connection.flush();
    });

    expect(selectHost).not.toHaveBeenCalled();
  });

  it('should clear pending commands throughout a detached subtree before remounting', async () => {
    const { connection, remoteControl, remoteRoot, selectionStore } =
      renderRemoteControl({ htmlTag: 'input' });
    const selectHost = jest.spyOn(HTMLInputElement.prototype, 'select');

    remoteControl.select();
    selectionStore.clearSubtree(remoteRoot);
    remoteControl.remove();

    await act(async () => {
      await Promise.resolve();
      connection.flush();
    });

    remoteRoot.append(remoteControl);

    await act(async () => {
      await Promise.resolve();
      connection.flush();
    });

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
    selectionStore.clearSubtree(remoteRoot);
    remoteControl.remove();

    await act(async () => {
      await Promise.resolve();
      connection.flush();
    });

    remoteRoot.append(remoteControl);

    await act(async () => {
      await Promise.resolve();
      connection.flush();
    });

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
