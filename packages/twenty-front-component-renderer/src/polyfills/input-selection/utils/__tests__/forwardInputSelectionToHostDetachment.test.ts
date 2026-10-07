import '@/remote/generated/remote-elements';

import { type RemoteElementSerialization } from '@remote-dom/core';
import {
  type BatchingRemoteConnection,
  serializeRemoteNode,
} from '@remote-dom/core/elements';
import { act } from 'react';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';
import { createRemoteTextControlRenderer } from '@/testing/createRemoteTextControlRenderer';
import { readRemoteSelectionCommands } from '@/testing/readRemoteSelectionCommands';
import { type InputSelectionState } from '@/types/InputSelectionState';

import { createWorkerInputSelectionStore } from '../createWorkerInputSelectionStore';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const flushRemoteMutations = async (connection: BatchingRemoteConnection) => {
  await act(async () => {
    await Promise.resolve();
    connection.flush();
  });
};

describe('forwarding input selection when the remote control moves, detaches or remounts', () => {
  const { renderRemoteControl, unmountRenderedRemoteControls } =
    createRemoteTextControlRenderer();

  afterEach(() => {
    jest.restoreAllMocks();
    unmountRenderedRemoteControls();
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
    expect(readRemoteSelectionCommands(remoteControl)).toEqual([]);
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
