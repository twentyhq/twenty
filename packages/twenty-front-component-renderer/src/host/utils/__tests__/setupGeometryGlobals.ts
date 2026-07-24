type GeometryFixture = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const setupGeometryGlobals = () => {
  const scheduledAnimationFrameCallbacksByHandle = new Map<
    number,
    FrameRequestCallback
  >();
  let nextAnimationFrameHandle = 1;
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
    const animationFrameHandle = nextAnimationFrameHandle;
    nextAnimationFrameHandle += 1;
    scheduledAnimationFrameCallbacksByHandle.set(
      animationFrameHandle,
      callback,
    );

    return animationFrameHandle;
  }) as typeof requestAnimationFrame;

  globalThis.cancelAnimationFrame = ((animationFrameHandle: number) => {
    scheduledAnimationFrameCallbacksByHandle.delete(animationFrameHandle);
  }) as typeof cancelAnimationFrame;

  return {
    getScheduledFrameCount: () => scheduledAnimationFrameCallbacksByHandle.size,
    flushAnimationFrame: () => {
      const [animationFrameHandle, callback] =
        scheduledAnimationFrameCallbacksByHandle.entries().next().value ?? [];

      if (animationFrameHandle !== undefined) {
        scheduledAnimationFrameCallbacksByHandle.delete(animationFrameHandle);
        callback?.(0);
      }
    },
    clearScheduledFrames: () => {
      scheduledAnimationFrameCallbacksByHandle.clear();
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

      node.getBoundingClientRect = () => {
        const top = currentGeometry.y;
        const left = currentGeometry.x;
        const right = currentGeometry.x + currentGeometry.width;
        const bottom = currentGeometry.y + currentGeometry.height;

        return {
          ...currentGeometry,
          top,
          left,
          right,
          bottom,
          toJSON: () => ({ ...currentGeometry, top, left, right, bottom }),
        } as DOMRect;
      };

      return {
        node,
        setGeometry: (nextGeometry: GeometryFixture) => {
          currentGeometry = nextGeometry;
        },
      };
    },
  };
};
