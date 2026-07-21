type GeometryFixture = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const setupGeometryGlobals = () => {
  const scheduledAnimationFrameCallbacks: FrameRequestCallback[] = [];
  const resizeObserverCallbacks: ResizeObserverCallback[] = [];
  const mutationObserverCallbacks: MutationCallback[] = [];

  class StubResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      resizeObserverCallbacks.push(callback);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  class StubMutationObserver {
    constructor(callback: MutationCallback) {
      mutationObserverCallbacks.push(callback);
    }
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }

  globalThis.ResizeObserver =
    StubResizeObserver as unknown as typeof ResizeObserver;
  globalThis.MutationObserver =
    StubMutationObserver as unknown as typeof MutationObserver;

  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    scheduledAnimationFrameCallbacks.push(callback);

    return scheduledAnimationFrameCallbacks.length;
  }) as typeof requestAnimationFrame;

  globalThis.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;

  return {
    getScheduledFrameCount: () => scheduledAnimationFrameCallbacks.length,
    flushAnimationFrame: () => {
      const callback = scheduledAnimationFrameCallbacks.shift();
      callback?.(0);
    },
    clearScheduledFrames: () => {
      scheduledAnimationFrameCallbacks.length = 0;
    },
    triggerResizeObserver: () => {
      for (const callback of resizeObserverCallbacks) {
        callback([], {} as ResizeObserver);
      }
    },
    triggerMutationObserver: () => {
      for (const callback of mutationObserverCallbacks) {
        callback([], {} as MutationObserver);
      }
    },
    createStubNode: (geometry: GeometryFixture) => {
      const node = document.createElement('div');
      document.body.append(node);

      let currentGeometry = geometry;

      node.getBoundingClientRect = () =>
        ({
          ...currentGeometry,
          top: currentGeometry.y,
          left: currentGeometry.x,
          right: currentGeometry.x + currentGeometry.width,
          bottom: currentGeometry.y + currentGeometry.height,
          toJSON: () => currentGeometry,
        }) as DOMRect;

      return {
        node,
        setGeometry: (nextGeometry: GeometryFixture) => {
          currentGeometry = nextGeometry;
        },
      };
    },
  };
};
