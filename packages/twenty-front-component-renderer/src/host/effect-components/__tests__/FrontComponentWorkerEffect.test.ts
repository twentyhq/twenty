import '@/testing/setupServerRenderingGlobals';

import { ThreadMessagePort } from '@quilted/threads';
import {
  MUTATION_TYPE_INSERT_CHILD,
  NODE_TYPE_TEXT,
  ROOT_ID,
} from '@remote-dom/core';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { act, createElement, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { fetchComponentSource } from '@/host/component-source/utils/fetchComponentSource';
import { type HostFocusController } from '@/host/focus/types/HostFocusController';
import { type HostScrollController } from '@/host/scroll/types/HostScrollController';
import { createFrontComponentHostThread } from '@/host/thread/utils/createFrontComponentHostThread';
import { createGeometryTrackerStub } from '@/testing/createGeometryTrackerStub';
import { createHostOutsidePressControllerStub } from '@/testing/createHostOutsidePressControllerStub';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { FrontComponentWorkerEffect } from '../FrontComponentWorkerEffect';

jest.mock('@/remote/sandbox/generated/frontComponentSandboxDocument', () => ({
  FRONT_COMPONENT_SANDBOX_DOCUMENT: '',
}));

jest.mock('@/remote/sandbox/utils/createFrontComponentSandboxIframe', () => ({
  createFrontComponentSandboxIframe: () => document.createElement('iframe'),
}));

jest.mock(
  '@/remote/sandbox/utils/createFrontComponentSandboxMessageHandler',
  () => ({
    createFrontComponentSandboxMessageHandler: () => jest.fn(),
  }),
);

jest.mock('@/host/thread/utils/createFrontComponentHostThread', () => ({
  createFrontComponentHostThread: jest.fn(),
}));

jest.mock('@/host/component-source/utils/fetchComponentSource', () => ({
  fetchComponentSource: jest.fn(),
}));

jest.mock('@/host/file-input/utils/createFileInputHost', () => ({
  createFileInputHost: () => ({ dispose: jest.fn() }),
}));

jest.mock('@/host/image-loading/utils/createImageLoadingHost', () => ({
  createImageLoadingHost: () => ({ dispose: jest.fn() }),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const createHostFocusControllerStub = (): HostFocusController => ({
  callFocusMethod: jest.fn(),
  retryPendingFocus: jest.fn(),
  reset: jest.fn(),
});

const createHostScrollControllerStub = (): HostScrollController => ({
  enqueueScrollCommands: jest.fn(),
  reset: jest.fn(),
});

const createDeferredRender = () => {
  const control = {
    resolveRender: () => {},
    rejectRender: (_error: Error) => {},
  };
  const pendingRender = new Promise<void>((resolve, reject) => {
    control.resolveRender = resolve;
    control.rejectRender = reject;
  });

  return {
    ...control,
    render: jest.fn<
      ReturnType<FrontComponentThread['imports']['render']>,
      Parameters<FrontComponentThread['imports']['render']>
    >(() => pendingRender),
  };
};

const mockThreadRender = (
  render: FrontComponentThread['imports']['render'],
) => {
  const thread: FrontComponentThread = new ThreadMessagePort(
    new MessageChannel().port1,
    { imports: ['render'] },
  );

  Object.defineProperty(thread.imports, 'render', { value: render });
  jest.mocked(createFrontComponentHostThread).mockReturnValue(thread);
};

const flushPendingWork = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

describe('FrontComponentWorkerEffect', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    jest.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    jest
      .mocked(fetchComponentSource)
      .mockResolvedValue('export default () => {};');
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const mountEffect = ({
    setReceiver,
    setError,
    componentProps,
    onReady,
  }: Pick<
    ComponentProps<typeof FrontComponentWorkerEffect>,
    'setReceiver' | 'setError' | 'componentProps' | 'onReady'
  >) => {
    const props: ComponentProps<typeof FrontComponentWorkerEffect> = {
      componentUrl: 'https://app.twenty.test/component.js',
      initialExecutionContext: {
        frontComponentId: 'front-component-id',
        userId: null,
        recordId: null,
        selectedRecordIds: [],
        timelineActivityId: null,
        colorScheme: 'light',
      },
      geometryTracker: createGeometryTrackerStub(),
      hostFocusController: createHostFocusControllerStub(),
      hostScrollController: createHostScrollControllerStub(),
      outsidePressController: createHostOutsidePressControllerStub(),
      setReceiver,
      setThread: jest.fn(),
      setError,
      componentProps,
      onReady,
    };
    const renderEffect = (
      updates: Partial<ComponentProps<typeof FrontComponentWorkerEffect>> = {},
    ) => {
      act(() => {
        root.render(
          createElement(FrontComponentWorkerEffect, { ...props, ...updates }),
        );
      });
    };

    renderEffect();

    return renderEffect;
  };

  it('keeps the receiver connected while waiting for readiness', async () => {
    const { render, resolveRender } = createDeferredRender();
    mockThreadRender(render);
    const setReceiver = jest.fn();
    const onReady = jest.fn();

    mountEffect({ setReceiver, setError: jest.fn(), onReady });
    await flushPendingWork();

    expect(setReceiver).toHaveBeenCalledWith(expect.any(RemoteReceiver));
    expect(onReady).not.toHaveBeenCalled();

    resolveRender();
    await flushPendingWork();

    expect(setReceiver).toHaveBeenCalledTimes(1);
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('keeps receiving late mutations after the initial render times out', async () => {
    const { render, rejectRender } = createDeferredRender();
    mockThreadRender(render);
    const setReceiver = jest.fn();
    const setError = jest.fn();
    const onReady = jest.fn();

    mountEffect({ setReceiver, setError, onReady });
    await flushPendingWork();

    const error = new Error('Front component initial render timed out.');
    rejectRender(error);
    await flushPendingWork();

    const receiver = setReceiver.mock.calls[0][0] as RemoteReceiver;
    const connection = render.mock.calls[0][0];
    connection.mutate([
      [
        MUTATION_TYPE_INSERT_CHILD,
        ROOT_ID,
        { id: 'late-text', type: NODE_TYPE_TEXT, data: 'Late render' },
        0,
      ],
    ]);

    expect(receiver.root.children).toEqual([
      expect.objectContaining({ data: 'Late render' }),
    ]);
    expect(setReceiver).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenLastCalledWith(error);
    expect(onReady).not.toHaveBeenCalled();
  });

  it('clears a previous error when new props restart the worker', async () => {
    const error = new Error('Initial render failed');
    const render = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue(undefined);
    mockThreadRender(render);
    const setError = jest.fn();
    const onReady = jest.fn();
    const rerender = mountEffect({
      setReceiver: jest.fn(),
      setError,
      onReady,
      componentProps: { count: 1 },
    });
    await flushPendingWork();
    expect(setError).toHaveBeenLastCalledWith(error);

    rerender({ componentProps: { count: 2 } });
    expect(setError).toHaveBeenLastCalledWith(null);
    await flushPendingWork();

    expect(setError).toHaveBeenLastCalledWith(null);
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('keeps the worker for equal props and uses the latest ready callback', async () => {
    const { render, resolveRender } = createDeferredRender();
    mockThreadRender(render);
    const firstReady = jest.fn();
    const latestReady = jest.fn();
    const setReceiver = jest.fn();
    const rerender = mountEffect({
      setReceiver,
      setError: jest.fn(),
      componentProps: { records: [{ id: 'sample' }] },
      onReady: firstReady,
    });
    await flushPendingWork();

    rerender({
      componentProps: { records: [{ id: 'sample' }] },
      onReady: latestReady,
    });
    resolveRender();
    await flushPendingWork();

    const nextReady = jest.fn();
    rerender({
      componentProps: { records: [{ id: 'sample' }] },
      onReady: nextReady,
    });
    await flushPendingWork();

    expect(createFrontComponentHostThread).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenCalledTimes(1);
    expect(setReceiver).toHaveBeenCalledTimes(1);
    expect(firstReady).not.toHaveBeenCalled();
    expect(latestReady).toHaveBeenCalledTimes(1);
    expect(nextReady).not.toHaveBeenCalled();
  });

  it('restarts with new data when props actually change', async () => {
    const render = jest.fn(async () => {});
    mockThreadRender(render);
    const rerender = mountEffect({
      setReceiver: jest.fn(),
      setError: jest.fn(),
      componentProps: { count: 1 },
    });
    await flushPendingWork();

    rerender({ componentProps: { count: 2 } });
    await flushPendingWork();

    expect(createFrontComponentHostThread).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.objectContaining({ componentProps: { count: 2 } }),
    );
  });
});
