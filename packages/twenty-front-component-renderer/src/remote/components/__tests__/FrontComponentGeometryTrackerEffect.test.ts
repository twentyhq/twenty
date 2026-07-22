import '../../../host/utils/__tests__/setupServerRenderingGlobals';

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { createStubGeometryTracker } from '@/__tests__/createStubGeometryTracker';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { FrontComponentGeometryTrackerEffect } from '../FrontComponentGeometryTrackerEffect';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createStubThread = () =>
  ({
    imports: { pushGeometryUpdates: jest.fn().mockResolvedValue(undefined) },
  }) as unknown as FrontComponentThread;

describe('FrontComponentGeometryTrackerEffect', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should arm the tracker on mount', () => {
    const geometryTracker = createStubGeometryTracker();
    const thread = createStubThread();

    act(() => {
      root.render(
        createElement(FrontComponentGeometryTrackerEffect, {
          thread,
          geometryTracker,
        }),
      );
    });

    expect(geometryTracker.setPushGeometryUpdates).toHaveBeenCalledTimes(1);
  });

  it('should forward a pushed batch to the worker thread', () => {
    const geometryTracker = createStubGeometryTracker();
    const thread = createStubThread();

    act(() => {
      root.render(
        createElement(FrontComponentGeometryTrackerEffect, {
          thread,
          geometryTracker,
        }),
      );
    });

    const pushGeometryUpdates = (
      geometryTracker.setPushGeometryUpdates as jest.Mock
    ).mock.calls[0][0];

    pushGeometryUpdates({ elements: {} });

    expect(thread.imports.pushGeometryUpdates).toHaveBeenCalledWith({
      elements: {},
    });
  });

  it('should reset the tracker on unmount', () => {
    const geometryTracker = createStubGeometryTracker();

    act(() => {
      root.render(
        createElement(FrontComponentGeometryTrackerEffect, {
          thread: createStubThread(),
          geometryTracker,
        }),
      );
    });

    act(() => {
      root.unmount();
    });

    expect(geometryTracker.reset).toHaveBeenCalledTimes(1);
  });

  it('should re-arm when the thread identity changes', () => {
    const geometryTracker = createStubGeometryTracker();

    act(() => {
      root.render(
        createElement(FrontComponentGeometryTrackerEffect, {
          thread: createStubThread(),
          geometryTracker,
        }),
      );
    });

    act(() => {
      root.render(
        createElement(FrontComponentGeometryTrackerEffect, {
          thread: createStubThread(),
          geometryTracker,
        }),
      );
    });

    expect(geometryTracker.setPushGeometryUpdates).toHaveBeenCalledTimes(2);
    expect(geometryTracker.reset).toHaveBeenCalledTimes(1);
  });
});
