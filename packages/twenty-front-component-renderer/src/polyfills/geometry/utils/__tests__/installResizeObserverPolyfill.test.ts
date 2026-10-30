import { Window } from '@remote-dom/polyfill';
import { isDefined } from 'twenty-shared/utils';

import { createElementGeometrySnapshotFixture } from '@/testing/createElementGeometrySnapshotFixture';
import { createViewportGeometrySnapshotFixture } from '@/testing/createViewportGeometrySnapshotFixture';
import { isElementNode } from '@/polyfills/dom/utils/isElementNode';
import { createWorkerGeometryStore } from '@/polyfills/geometry/utils/createWorkerGeometryStore';
import { installResizeObserverPolyfill } from '@/polyfills/geometry/utils/installResizeObserverPolyfill';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

const remoteElementIds = new WeakMap<object, string>();
let nextRemoteElementId = 0;

jest.mock('@remote-dom/core/elements', () => ({
  remoteId: (element: object) => {
    const existingRemoteElementId = remoteElementIds.get(element);

    if (isDefined(existingRemoteElementId)) {
      return existingRemoteElementId;
    }

    const remoteElementId = String(nextRemoteElementId);
    nextRemoteElementId += 1;
    remoteElementIds.set(element, remoteElementId);

    return remoteElementId;
  },
}));

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

const toElement = <TNode>(node: TNode): TNode & Element => {
  if (!isElementNode(node)) {
    throw new Error('Expected the remote-dom polyfill to create an element.');
  }

  return node;
};

const createSandbox = () => {
  const polyfillWindow = new Window();
  const { document } = polyfillWindow;
  const createElement = (tagName: string) =>
    toElement(document.createElement(tagName));
  const body = toElement(document.body);
  const root = createElement('div');
  const target = createElement('div');
  body.appendChild(root);
  root.appendChild(target);
  const geometryStore = createWorkerGeometryStore();
  geometryStore.setRootElement(body);
  const observeElementGeometry = jest.fn().mockResolvedValue(undefined);
  const unobserveElementGeometry = jest.fn().mockResolvedValue(undefined);
  geometryStore.connectTransport({
    observeElementGeometry,
    unobserveElementGeometry,
  });
  const globalScope: Record<string, unknown> = { window: polyfillWindow };
  installResizeObserverPolyfill({
    globalScope,
    geometryStore,
  });

  const applySnapshot = (overrides: Partial<ElementGeometrySnapshot> = {}) => {
    const remoteElementId = remoteElementIds.get(target);

    if (!isDefined(remoteElementId)) {
      throw new Error('The target must be observed before applying geometry.');
    }

    geometryStore.applyGeometryBatch({
      elements: {
        [remoteElementId]: createElementGeometrySnapshotFixture({
          width: 100,
          height: 50,
          offsetWidth: 100,
          offsetHeight: 50,
          clientWidth: 80,
          clientHeight: 30,
          ...overrides,
        }),
      },
    });
  };

  return {
    polyfillWindow,
    globalScope,
    body,
    createElement,
    root,
    target,
    geometryStore,
    observeElementGeometry,
    unobserveElementGeometry,
    applySnapshot,
    ResizeObserver: globalScope.ResizeObserver as typeof ResizeObserver,
  };
};

describe('installResizeObserverPolyfill', () => {
  beforeEach(() => {
    nextRemoteElementId = 0;
    jest.restoreAllMocks();
  });

  it('installs the same constructor in the worker and its owning window', () => {
    const { globalScope, polyfillWindow, ResizeObserver } = createSandbox();

    expect(globalScope.ResizeObserver).toBe(ResizeObserver);
    expect(Reflect.get(polyfillWindow, 'ResizeObserver')).toBe(ResizeObserver);
  });

  it('waits for initial host geometry and delivers the owned target and box shapes', async () => {
    const { ResizeObserver, target, applySnapshot } = createSandbox();
    const callback = jest.fn();
    const observer = new ResizeObserver(callback);
    observer.observe(target);
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();

    applySnapshot({
      clientWidth: 85,
      clientHeight: 37,
      computedStyle: { 'padding-left': '5px', 'padding-top': '7px' },
    });
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(1);
    const [[entry], deliveredObserver] = callback.mock.calls[0];
    expect(deliveredObserver).toBe(observer);
    expect(entry.target).toBe(target);
    expect(entry.contentRect).toMatchObject({
      x: 5,
      y: 7,
      width: 80,
      height: 30,
    });
    expect(entry.contentBoxSize).toEqual([{ inlineSize: 80, blockSize: 30 }]);
    expect(entry.borderBoxSize).toEqual([{ inlineSize: 100, blockSize: 50 }]);
    expect(entry.devicePixelContentBoxSize).toEqual([
      { inlineSize: 80, blockSize: 30 },
    ]);
  });

  it('delivers an already measured target asynchronously', async () => {
    const { ResizeObserver, target, geometryStore, applySnapshot } =
      createSandbox();
    geometryStore.resolveElementSnapshot(target);
    applySnapshot();
    const callback = jest.fn();
    new ResizeObserver(callback).observe(target);

    expect(callback).not.toHaveBeenCalled();
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not report position, scroll or viewport changes as content resizing', async () => {
    const { ResizeObserver, target, applySnapshot, geometryStore } =
      createSandbox();
    const callback = jest.fn();
    new ResizeObserver(callback).observe(target);
    applySnapshot();
    await flushMicrotasks();

    applySnapshot({ x: 300, y: 400, scrollTop: 200, scrollHeight: 700 });
    geometryStore.applyGeometryBatch({
      viewport: createViewportGeometrySnapshotFixture({ innerWidth: 600 }),
    });
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('coalesces geometry updates and delivers only targets whose selected size changed', async () => {
    const { ResizeObserver, target, applySnapshot } = createSandbox();
    const callback = jest.fn();
    const observer = new ResizeObserver(callback);
    observer.observe(target);
    observer.observe(target);
    applySnapshot();
    applySnapshot({ clientWidth: 110 });
    applySnapshot({ clientWidth: 120 });
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toHaveLength(1);
    expect(callback.mock.calls[0][0][0].contentRect.width).toBe(120);

    applySnapshot({ clientWidth: 120, clientHeight: 60 });
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('uses content or border size according to each observation option', async () => {
    const { ResizeObserver, target, applySnapshot } = createSandbox();
    const contentCallback = jest.fn();
    const borderCallback = jest.fn();
    new ResizeObserver(contentCallback).observe(target);
    new ResizeObserver(borderCallback).observe(target, { box: 'border-box' });
    applySnapshot();
    await flushMicrotasks();

    applySnapshot({ offsetWidth: 130 });
    await flushMicrotasks();
    expect(contentCallback).toHaveBeenCalledTimes(1);
    expect(borderCallback).toHaveBeenCalledTimes(2);

    applySnapshot({ offsetWidth: 130, clientWidth: 60 });
    await flushMicrotasks();
    expect(contentCallback).toHaveBeenCalledTimes(2);
    expect(borderCallback).toHaveBeenCalledTimes(2);
  });

  it('reports subpixel resizes from the host computed width and height', async () => {
    const { ResizeObserver, target, applySnapshot } = createSandbox();
    const callback = jest.fn();
    new ResizeObserver(callback).observe(target);
    const applyComputedWidth = (width: string) =>
      applySnapshot({
        offsetWidth: 100,
        offsetHeight: 40,
        clientWidth: 100,
        clientHeight: 40,
        computedStyle: { width, height: '40px' },
      });

    applyComputedWidth('100.1px');
    await flushMicrotasks();
    applyComputedWidth('100.4px');
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback.mock.calls[0][0][0].contentBoxSize).toEqual([
      { inlineSize: 100.1, blockSize: 40 },
    ]);
    const [[entry]] = callback.mock.calls[1];
    expect(entry.contentRect.width).toBe(100.4);
    expect(entry.contentBoxSize).toEqual([
      { inlineSize: 100.4, blockSize: 40 },
    ]);
    expect(entry.borderBoxSize).toEqual([{ inlineSize: 100.4, blockSize: 40 }]);
  });

  it('removes border-box edges and scrollbars from the host computed size', async () => {
    const { ResizeObserver, target, applySnapshot } = createSandbox();
    const callback = jest.fn();
    new ResizeObserver(callback).observe(target);

    applySnapshot({
      offsetWidth: 200,
      offsetHeight: 100,
      clientWidth: 175,
      clientHeight: 90,
      computedStyle: {
        width: '200px',
        height: '100px',
        'box-sizing': 'border-box',
        'padding-left': '10px',
        'padding-right': '10px',
        'border-left-width': '5px',
        'border-right-width': '5px',
        'border-top-width': '5px',
        'border-bottom-width': '5px',
        'overflow-y': 'scroll',
      },
    });
    await flushMicrotasks();

    const [[entry]] = callback.mock.calls[0];
    expect(entry.contentRect).toMatchObject({
      x: 10,
      y: 0,
      width: 155,
      height: 90,
    });
    expect(entry.contentBoxSize).toEqual([{ inlineSize: 155, blockSize: 90 }]);
    expect(entry.borderBoxSize).toEqual([{ inlineSize: 200, blockSize: 100 }]);
  });

  it('reports SVG graphics sizes from their host bounding box', async () => {
    const { ResizeObserver, target, applySnapshot } = createSandbox();
    const callback = jest.fn();
    new ResizeObserver(callback).observe(target);
    const applySvgBoundingBoxWidth = (svgBoundingBoxWidth: number) =>
      applySnapshot({
        offsetWidth: 0,
        offsetHeight: 0,
        clientWidth: 0,
        clientHeight: 0,
        svgBoundingBoxWidth,
        svgBoundingBoxHeight: 40,
      });

    applySvgBoundingBoxWidth(80);
    await flushMicrotasks();
    applySvgBoundingBoxWidth(120);
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback.mock.calls[0][0][0].contentRect).toMatchObject({
      x: 0,
      y: 0,
      width: 80,
      height: 40,
    });
    expect(callback.mock.calls[1][0][0].contentBoxSize).toEqual([
      { inlineSize: 120, blockSize: 40 },
    ]);
    expect(callback.mock.calls[1][0][0].borderBoxSize).toEqual([
      { inlineSize: 120, blockSize: 40 },
    ]);
  });

  it('unobserves one target while keeping other measured targets delivered', async () => {
    const {
      ResizeObserver,
      target,
      createElement,
      root,
      geometryStore,
      applySnapshot,
    } = createSandbox();
    const secondTarget = createElement('div');
    root.appendChild(secondTarget);
    const callback = jest.fn();
    const observer = new ResizeObserver(callback);
    observer.observe(target);
    observer.observe(secondTarget);
    applySnapshot();
    const secondRemoteElementId = remoteElementIds.get(secondTarget);

    if (!isDefined(secondRemoteElementId)) {
      throw new Error(
        'The second target must be observed before applying geometry.',
      );
    }
    geometryStore.applyGeometryBatch({
      elements: {
        [secondRemoteElementId]: createElementGeometrySnapshotFixture({
          clientWidth: 70,
          clientHeight: 20,
        }),
      },
    });
    await flushMicrotasks();
    expect(
      callback.mock.calls[0][0].map(
        (entry: ResizeObserverEntry) => entry.target,
      ),
    ).toEqual([target, secondTarget]);

    observer.unobserve(target);
    applySnapshot({ clientWidth: 200 });
    geometryStore.applyGeometryBatch({
      elements: {
        [secondRemoteElementId]: createElementGeometrySnapshotFixture({
          clientWidth: 90,
          clientHeight: 20,
        }),
      },
    });
    await flushMicrotasks();
    expect(
      callback.mock.calls[1][0].map(
        (entry: ResizeObserverEntry) => entry.target,
      ),
    ).toEqual([secondTarget]);

    observer.unobserve(secondTarget);
    applySnapshot({ clientWidth: 300 });
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('releases host capacity while observing and unobserving connected targets', async () => {
    const {
      ResizeObserver,
      createElement,
      root,
      observeElementGeometry,
      unobserveElementGeometry,
    } = createSandbox();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const observer = new ResizeObserver(jest.fn());

    for (let index = 0; index < 501; index += 1) {
      const target = createElement('div');
      root.appendChild(target);
      observer.observe(target);
      await flushMicrotasks();
      observer.unobserve(target);
    }

    await flushMicrotasks();

    expect(observeElementGeometry).toHaveBeenCalledTimes(501);
    expect(unobserveElementGeometry).toHaveBeenCalledTimes(501);
    expect(warn).not.toHaveBeenCalled();
  });

  it('retries a capacity-blocked target when another connected observation releases its slot', async () => {
    const {
      ResizeObserver,
      createElement,
      root,
      target,
      observeElementGeometry,
    } = createSandbox();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const observer = new ResizeObserver(jest.fn());
    observer.observe(target);

    for (let index = 1; index < 500; index += 1) {
      const observedTarget = createElement('div');
      root.appendChild(observedTarget);
      observer.observe(observedTarget);
    }

    await flushMicrotasks();
    const pendingTarget = createElement('div');
    root.appendChild(pendingTarget);
    const pendingObserver = new ResizeObserver(jest.fn());
    pendingObserver.observe(pendingTarget);
    await flushMicrotasks();
    expect(observeElementGeometry).toHaveBeenCalledTimes(1);

    observer.unobserve(target);
    await flushMicrotasks();
    await flushMicrotasks();

    expect(observeElementGeometry).toHaveBeenCalledTimes(2);
    expect(observeElementGeometry).toHaveBeenLastCalledWith([
      remoteElementIds.get(pendingTarget),
    ]);
  });

  it('preserves measured geometry when a target is reobserved within the same update', async () => {
    const {
      ResizeObserver,
      target,
      applySnapshot,
      observeElementGeometry,
      unobserveElementGeometry,
    } = createSandbox();
    const callback = jest.fn();
    const observer = new ResizeObserver(callback);
    observer.observe(target);
    applySnapshot();
    await flushMicrotasks();
    callback.mockClear();

    observer.unobserve(target);
    observer.observe(target);
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0][0].contentRect.width).toBe(80);
    expect(observeElementGeometry).toHaveBeenCalledTimes(1);
    expect(unobserveElementGeometry).not.toHaveBeenCalled();
  });

  it('releases shared host geometry only after the last observer stops', async () => {
    const { ResizeObserver, target, unobserveElementGeometry } =
      createSandbox();
    const firstObserver = new ResizeObserver(jest.fn());
    const secondObserver = new ResizeObserver(jest.fn());
    firstObserver.observe(target);
    secondObserver.observe(target);
    await flushMicrotasks();

    firstObserver.unobserve(target);
    expect(unobserveElementGeometry).not.toHaveBeenCalled();

    secondObserver.disconnect();
    await flushMicrotasks();
    expect(unobserveElementGeometry).toHaveBeenCalledWith([
      remoteElementIds.get(target),
    ]);
  });

  it('cancels enrollment when unobserved before its host request is sent', async () => {
    const {
      ResizeObserver,
      target,
      observeElementGeometry,
      unobserveElementGeometry,
    } = createSandbox();
    const observer = new ResizeObserver(jest.fn());
    observer.observe(target);
    observer.unobserve(target);
    await flushMicrotasks();

    expect(observeElementGeometry).not.toHaveBeenCalled();
    expect(unobserveElementGeometry).not.toHaveBeenCalled();
  });

  it('reuses one geometry reader when the observed box changes', async () => {
    const { ResizeObserver, target, unobserveElementGeometry } =
      createSandbox();
    const observer = new ResizeObserver(jest.fn());
    observer.observe(target);
    observer.observe(target, { box: 'border-box' });
    await flushMicrotasks();
    observer.disconnect();
    await flushMicrotasks();

    expect(unobserveElementGeometry).toHaveBeenCalledTimes(1);
  });

  it('releases all connected targets on disconnect', async () => {
    const {
      ResizeObserver,
      target,
      createElement,
      root,
      unobserveElementGeometry,
    } = createSandbox();
    const secondTarget = createElement('div');
    root.appendChild(secondTarget);
    const observer = new ResizeObserver(jest.fn());
    observer.observe(target);
    observer.observe(secondTarget);
    await flushMicrotasks();
    observer.disconnect();
    observer.disconnect();
    await flushMicrotasks();

    expect(unobserveElementGeometry.mock.calls).toEqual([
      [[remoteElementIds.get(target)]],
      [[remoteElementIds.get(secondTarget)]],
    ]);
  });

  it('keeps host geometry needed by a direct measurement after observer teardown', async () => {
    const {
      ResizeObserver,
      target,
      geometryStore,
      applySnapshot,
      unobserveElementGeometry,
    } = createSandbox();
    const observer = new ResizeObserver(jest.fn());
    observer.observe(target);
    geometryStore.resolveElementSnapshot(target);
    applySnapshot();
    await flushMicrotasks();

    observer.disconnect();
    await flushMicrotasks();
    applySnapshot({ width: 140 });

    expect(unobserveElementGeometry).not.toHaveBeenCalled();
    expect(geometryStore.resolveElementSnapshot(target)?.width).toBe(140);
  });

  it('reports logical block and inline sizes for vertical writing mode', async () => {
    const { ResizeObserver, target, applySnapshot } = createSandbox();
    const callback = jest.fn();
    new ResizeObserver(callback).observe(target);
    applySnapshot({ computedStyle: { 'writing-mode': 'vertical-rl' } });
    await flushMicrotasks();

    expect(callback.mock.calls[0][0][0].contentBoxSize).toEqual([
      { inlineSize: 30, blockSize: 80 },
    ]);
    expect(callback.mock.calls[0][0][0].borderBoxSize).toEqual([
      { inlineSize: 50, blockSize: 100 },
    ]);
  });

  it('uses the scoped viewport scale for device pixel sizes', async () => {
    const { ResizeObserver, target, geometryStore, applySnapshot } =
      createSandbox();
    geometryStore.applyGeometryBatch({
      viewport: createViewportGeometrySnapshotFixture({ devicePixelRatio: 2 }),
    });
    const callback = jest.fn();
    new ResizeObserver(callback).observe(target, {
      box: 'device-pixel-content-box',
    });
    applySnapshot();
    await flushMicrotasks();

    expect(callback.mock.calls[0][0][0].devicePixelContentBoxSize).toEqual([
      { inlineSize: 160, blockSize: 60 },
    ]);
  });

  it('supports zero-sized measured elements without inventing an unmeasured delivery', async () => {
    const { ResizeObserver, target, applySnapshot } = createSandbox();
    const callback = jest.fn();
    new ResizeObserver(callback).observe(target);
    applySnapshot({ clientWidth: 0, clientHeight: 0 });
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0][0].contentRect.width).toBe(0);
  });

  it('stops queued delivery on unobserve and can observe the target again', async () => {
    const { ResizeObserver, target, applySnapshot } = createSandbox();
    const callback = jest.fn();
    const observer = new ResizeObserver(callback);
    observer.observe(target);
    applySnapshot();
    observer.unobserve(target);
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();

    observer.observe(target);
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();

    applySnapshot();
    await flushMicrotasks();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('disconnects one observer and leaves other observers working', async () => {
    const { ResizeObserver, target, applySnapshot } = createSandbox();
    const disconnectedCallback = jest.fn();
    const liveCallback = jest.fn();
    const disconnectedObserver = new ResizeObserver(disconnectedCallback);
    disconnectedObserver.observe(target);
    new ResizeObserver(liveCallback).observe(target);
    disconnectedObserver.disconnect();
    applySnapshot();
    await flushMicrotasks();

    expect(disconnectedCallback).not.toHaveBeenCalled();
    expect(liveCallback).toHaveBeenCalledTimes(1);
  });

  it('should report a zero size when a measured target is removed and resume after reinsertion', async () => {
    const {
      ResizeObserver,
      target,
      root,
      body,
      applySnapshot,
      observeElementGeometry,
      unobserveElementGeometry,
    } = createSandbox();
    const callback = jest.fn();
    const observer = new ResizeObserver(callback);
    observer.observe(target);
    applySnapshot();
    await flushMicrotasks();
    callback.mockClear();

    applySnapshot({ clientWidth: 120 });
    body.removeChild(root);
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0][0].contentRect.width).toBe(0);
    expect(callback.mock.calls[0][0][0].contentBoxSize).toEqual([
      { inlineSize: 0, blockSize: 0 },
    ]);
    expect(unobserveElementGeometry).toHaveBeenCalledWith([
      remoteElementIds.get(target),
    ]);

    body.appendChild(root);
    await flushMicrotasks();
    expect(observeElementGeometry).toHaveBeenCalledTimes(2);

    applySnapshot({ clientWidth: 140 });
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback.mock.calls[1][0][0].contentRect.width).toBe(140);
  });

  it('should observe the document body through the renderer root size without enrolling host-less elements', async () => {
    const {
      ResizeObserver,
      createElement,
      body,
      root,
      geometryStore,
      observeElementGeometry,
    } = createSandbox();
    const renderContainer = createElement('remote-fragment');
    root.appendChild(renderContainer);
    const bodyCallback = jest.fn();
    const renderContainerCallback = jest.fn();
    new ResizeObserver(bodyCallback).observe(body);
    new ResizeObserver(renderContainerCallback).observe(renderContainer);

    geometryStore.applyGeometryBatch({
      viewport: createViewportGeometrySnapshotFixture({
        rootContainerWidth: 320,
        rootContainerHeight: 200,
        rootContainerClientWidth: 300,
        rootContainerClientHeight: 180,
      }),
    });
    await flushMicrotasks();

    expect(bodyCallback).toHaveBeenCalledTimes(1);
    expect(bodyCallback.mock.calls[0][0][0].target).toBe(body);
    expect(bodyCallback.mock.calls[0][0][0].contentBoxSize).toEqual([
      { inlineSize: 300, blockSize: 180 },
    ]);
    expect(renderContainerCallback).not.toHaveBeenCalled();
    expect(observeElementGeometry).not.toHaveBeenCalled();
  });

  it('keeps observation when a target moves between connected parents in one update', async () => {
    const { ResizeObserver, target, root, createElement, applySnapshot } =
      createSandbox();
    const callback = jest.fn();
    new ResizeObserver(callback).observe(target);
    const nextParent = createElement('div');
    root.appendChild(nextParent);
    root.removeChild(target);
    nextParent.appendChild(target);
    applySnapshot();
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('waits for an initially detached target to connect before requesting its first measured delivery', async () => {
    const { ResizeObserver, target, root, applySnapshot } = createSandbox();
    root.removeChild(target);
    const callback = jest.fn();
    new ResizeObserver(callback).observe(target);
    await flushMicrotasks();
    expect(callback).not.toHaveBeenCalled();

    root.appendChild(target);
    await flushMicrotasks();
    applySnapshot();
    await flushMicrotasks();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0][0].target).toBe(target);
  });

  it('isolates observer delivery and teardown between renderer instances', async () => {
    const first = createSandbox();
    const second = createSandbox();
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();
    new first.ResizeObserver(firstCallback).observe(first.target);
    new second.ResizeObserver(secondCallback).observe(second.target);
    first.applySnapshot();
    await flushMicrotasks();
    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).not.toHaveBeenCalled();

    first.body.removeChild(first.root);
    second.applySnapshot();
    await flushMicrotasks();
    expect(firstCallback).toHaveBeenCalledTimes(2);
    expect(firstCallback.mock.calls[1][0][0].contentRect.width).toBe(0);
    expect(secondCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback.mock.calls[0][0][0].target).toBe(second.target);
  });

  it('rejects invalid callbacks and targets', () => {
    const { ResizeObserver } = createSandbox();
    const observer = new ResizeObserver(jest.fn());

    expect(() => Reflect.construct(ResizeObserver, [null])).toThrow(TypeError);
    expect(() => Reflect.apply(observer.observe, observer, [{}])).toThrow(
      TypeError,
    );
  });
});
