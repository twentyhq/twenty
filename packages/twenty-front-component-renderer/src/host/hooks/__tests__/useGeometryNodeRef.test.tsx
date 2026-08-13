import '@/testing/setupServerRenderingGlobals';

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { createStubGeometryTracker } from '@/testing/createStubGeometryTracker';
import { FrontComponentGeometryTrackerContext } from '@/host/contexts/FrontComponentGeometryTrackerContext';
import { type GeometryTracker } from '@/host/types/GeometryTracker';
import { useGeometryNodeRef } from '../useGeometryNodeRef';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const GeometryNodeRefConsumer = ({
  remoteElementId,
}: {
  remoteElementId: string;
}) => createElement('div', { ref: useGeometryNodeRef(remoteElementId) });

const renderWithTracker = (tracker: GeometryTracker, remoteElementId: string) =>
  createElement(
    FrontComponentGeometryTrackerContext.Provider,
    { value: tracker },
    createElement(GeometryNodeRefConsumer, { remoteElementId }),
  );

describe('useGeometryNodeRef', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('should re-register the mounted element when the remote id changes', () => {
    const tracker = createStubGeometryTracker();

    act(() => {
      root.render(renderWithTracker(tracker, 'first-id'));
    });

    expect(tracker.registerNode).toHaveBeenCalledWith(
      'first-id',
      expect.any(HTMLElement),
    );

    act(() => {
      root.render(renderWithTracker(tracker, 'second-id'));
    });

    expect(tracker.unregisterNode).toHaveBeenCalledWith(
      'first-id',
      expect.any(HTMLElement),
    );
    expect(tracker.registerNode).toHaveBeenCalledWith(
      'second-id',
      expect.any(HTMLElement),
    );
  });
});
