import '@/testing/setupServerRenderingGlobals';

import { RemoteReceiver } from '@remote-dom/core/receivers';
import { act, createElement } from 'react';
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
  let resolveRender: () => void = () => {};
  let rejectRender: (error: Error) => void = () => {};

  const render = jest.fn(
    () =>
      new Promise<void>((resolve, reject) => {
        resolveRender = resolve;
        rejectRender = reject;
      }),
  );

  return {
    render,
    resolveRender: () => resolveRender(),
    rejectRender: (error: Error) => rejectRender(error),
  };
};

const flushPendingWork = () =>
  act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

describe('FrontComponentWorkerEffect', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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
  }: {
    setReceiver: jest.Mock;
    setError: jest.Mock;
  }) => {
    act(() => {
      root.render(
        createElement(FrontComponentWorkerEffect, {
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
        }),
      );
    });
  };

  it('should hand the receiver to the host only once the worker has rendered', async () => {
    const { render, resolveRender } = createDeferredRender();

    jest.mocked(createFrontComponentHostThread).mockReturnValue({
      imports: { render },
    } as unknown as FrontComponentThread);

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

    jest.mocked(createFrontComponentHostThread).mockReturnValue({
      imports: { render },
    } as unknown as FrontComponentThread);

    const setReceiver = jest.fn();
    const setError = jest.fn();

    mountEffect({ setReceiver, setError });
    await flushPendingWork();

    rejectRender(new Error('render failed'));
    await flushPendingWork();

    expect(setReceiver).not.toHaveBeenCalled();
    expect(setError).toHaveBeenCalledWith(expect.any(Error));
  });
});
