import '@/testing/setupServerRenderingGlobals';

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { CustomError } from 'twenty-shared/utils';

import { fetchComponentSource } from '@/host/component-source/utils/fetchComponentSource';
import { FrontComponentWorkerEffect } from '@/host/effect-components/FrontComponentWorkerEffect';
import { createFrontComponentHostThread } from '@/host/thread/utils/createFrontComponentHostThread';
import { createGeometryTrackerStub } from '@/testing/createGeometryTrackerStub';
import { type FrontComponentThread } from '@/types/FrontComponentThread';

jest.mock('@/host/component-source/utils/fetchComponentSource', () => ({
  fetchComponentSource: jest.fn(),
}));

jest.mock('@/host/thread/utils/createFrontComponentHostThread', () => ({
  createFrontComponentHostThread: jest.fn(),
}));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const COMPONENT_URL = `https://api.twenty.com/rest/front-components/component-id/${'a'.repeat(64)}.js`;
const COMPONENT_SOURCE = 'export default () => {};';

const fetchComponentSourceMock = jest.mocked(fetchComponentSource);
const createFrontComponentHostThreadMock = jest.mocked(
  createFrontComponentHostThread,
);

const flushPendingWork = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

describe('FrontComponentWorkerEffect', () => {
  let container: HTMLDivElement;
  let root: Root;
  let render: jest.Mock;
  let setError: jest.Mock;

  const renderWorkerEffect = async () => {
    await act(async () => {
      root.render(
        createElement(FrontComponentWorkerEffect, {
          componentUrl: COMPONENT_URL,
          geometryTracker: createGeometryTrackerStub(),
          setReceiver: jest.fn(),
          setThread: jest.fn(),
          setError,
        }),
      );
    });

    await flushPendingWork();
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    render = jest.fn().mockResolvedValue(undefined);
    setError = jest.fn();
    createFrontComponentHostThreadMock.mockReturnValue({
      imports: { render },
    } as unknown as FrontComponentThread);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    jest.clearAllMocks();
  });

  it('clears a previous error before starting a load', async () => {
    fetchComponentSourceMock.mockResolvedValue(COMPONENT_SOURCE);

    await renderWorkerEffect();

    expect(setError).toHaveBeenNthCalledWith(1, null);
  });

  it('never hands a rejected source to the worker', async () => {
    const integrityError = new CustomError(
      'checksum mismatch',
      'FRONT_COMPONENT_SOURCE_CHECKSUM_MISMATCH',
    );

    fetchComponentSourceMock.mockRejectedValue(integrityError);

    await renderWorkerEffect();

    expect(render).not.toHaveBeenCalled();
    expect(setError).toHaveBeenLastCalledWith(integrityError);
  });

  it('renders a verified source in the worker', async () => {
    fetchComponentSourceMock.mockResolvedValue(COMPONENT_SOURCE);

    await renderWorkerEffect();

    expect(render).toHaveBeenCalledTimes(1);
    expect(render.mock.calls[0][1]).toMatchObject({
      componentUrl: COMPONENT_URL,
      componentSource: COMPONENT_SOURCE,
    });
    expect(setError).not.toHaveBeenCalledWith(expect.any(Error));
  });
});
