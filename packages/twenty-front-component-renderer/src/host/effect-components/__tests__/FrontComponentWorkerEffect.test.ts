import '@/testing/setupServerRenderingGlobals';

import { ThreadMessagePort } from '@quilted/threads';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { act, createElement, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { fetchComponentSource } from '@/host/component-source/utils/fetchComponentSource';
import { type HostFocusController } from '@/host/focus/types/HostFocusController';
import { type HostScrollController } from '@/host/scroll/types/HostScrollController';
import { createFrontComponentHostThread } from '@/host/thread/utils/createFrontComponentHostThread';
import { createGeometryTrackerStub } from '@/testing/createGeometryTrackerStub';
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

  return { ...control, render: jest.fn(() => pendingRender) };
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

  it('should hand the receiver to the host only once the worker has rendered', async () => {
    const { render, resolveRender } = createDeferredRender();

    mockThreadRender(render);

    const setReceiver = jest.fn();

    mountEffect({ setReceiver, setError: jest.fn() });
    await flushPendingWork();

    expect(render).toHaveBeenCalledTimes(1);
    expect(setReceiver).not.toHaveBeenCalled();

    resolveRender();
    await flushPendingWork();

    expect(setReceiver).toHaveBeenCalledTimes(1);
    expect(setReceiver).toHaveBeenCalledWith(expect.any(RemoteReceiver));
  });

  it('should report a failed render instead of handing over the receiver', async () => {
    const { render, rejectRender } = createDeferredRender();

    mockThreadRender(render);

    const setReceiver = jest.fn();
    const setError = jest.fn();

    mountEffect({ setReceiver, setError });
    await flushPendingWork();

    rejectRender(new Error('render failed'));
    await flushPendingWork();

    expect(setReceiver).not.toHaveBeenCalled();
    expect(setError).toHaveBeenCalledWith(expect.any(Error));
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
