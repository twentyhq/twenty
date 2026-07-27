import '../../utils/__tests__/setupServerRenderingGlobals';

import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { createStubGeometryTracker } from '@/__tests__/createStubGeometryTracker';
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
  it('should re-register the mounted element when the remote id changes', () => {
    const tracker = createStubGeometryTracker();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

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

    act(() => {
      root.unmount();
    });
  });
});
