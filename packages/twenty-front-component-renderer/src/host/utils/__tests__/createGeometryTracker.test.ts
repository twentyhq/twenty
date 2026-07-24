import { setupGeometryGlobals } from './setupGeometryGlobals';

import { GEOMETRY_IDLE_FRAME_THRESHOLD } from '@/host/constants/GeometryIdleFrameThreshold';
import { createGeometryTracker } from '../createGeometryTracker';

const geometryGlobals = setupGeometryGlobals();

const armedTrackers: ReturnType<typeof createGeometryTracker>[] = [];

const createArmedTracker = () => {
  const tracker = createGeometryTracker();
  const pushGeometryUpdates = jest.fn();

  tracker.setPushGeometryUpdates(pushGeometryUpdates);
  armedTrackers.push(tracker);

  return { tracker, pushGeometryUpdates };
};

const flushFrames = (frameCount: number) => {
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    geometryGlobals.flushAnimationFrame();
  }
};

describe('createGeometryTracker', () => {
  beforeEach(() => {
    geometryGlobals.clearScheduledFrames();
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  afterEach(() => {
    for (const tracker of armedTrackers) {
      tracker.reset();
    }
    armedTrackers.length = 0;
  });

  it('should not schedule a frame when created', () => {
    armedTrackers.push(createGeometryTracker());

    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should not schedule a frame when observing before being armed', () => {
    const tracker = createGeometryTracker();
    armedTrackers.push(tracker);

    tracker.observe(['1']);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should push ids observed before it was armed', () => {
    const tracker = createGeometryTracker();
    armedTrackers.push(tracker);

    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 13,
      height: 13,
    });

    tracker.registerNode('1', stub.node);
    tracker.observe(['1']);

    const pushGeometryUpdates = jest.fn();
    tracker.setPushGeometryUpdates(pushGeometryUpdates);

    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates).toHaveBeenCalledTimes(1);
    expect(pushGeometryUpdates.mock.calls[0][0].elements['1'].width).toBe(13);
  });

  it('should not schedule a frame when arming with nothing observed', () => {
    const tracker = createGeometryTracker();
    armedTrackers.push(tracker);

    tracker.setPushGeometryUpdates(jest.fn());

    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should not schedule a frame when every observed id is rejected', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();

    tracker.observe([42, null, 'x'.repeat(200)]);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
    expect(pushGeometryUpdates).not.toHaveBeenCalled();
  });

  it('should not schedule a frame when re-observing an already observed id', () => {
    const { tracker } = createArmedTracker();
    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });

    tracker.registerNode('1', stub.node);
    tracker.observe(['1']);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    tracker.observe(['1']);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should never push while nothing is observed', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', stub.node);
    flushFrames(5);

    expect(pushGeometryUpdates).not.toHaveBeenCalled();
    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should push a batch containing only observed nodes', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
    });
    const unobserved = geometryGlobals.createStubNode({
      x: 9,
      y: 9,
      width: 9,
      height: 9,
    });

    tracker.registerNode('1', observed.node);
    tracker.registerNode('2', unobserved.node);
    tracker.observe(['1']);

    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates).toHaveBeenCalledTimes(1);
    const batch = pushGeometryUpdates.mock.calls[0][0];
    expect(Object.keys(batch.elements)).toEqual(['1']);
    expect(batch.elements['1'].width).toBe(3);
  });

  it('should not push a second batch when nothing changed', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);

    flushFrames(3);

    expect(pushGeometryUpdates).toHaveBeenCalledTimes(1);
  });

  it('should push when a rect changes by more than the epsilon', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();

    observed.setGeometry({ x: 0, y: 0, width: 20, height: 10 });
    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates).toHaveBeenCalledTimes(2);
    expect(pushGeometryUpdates.mock.calls[1][0].elements['1'].width).toBe(20);
  });

  it('should not push when a rect changes by less than the epsilon', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();

    observed.setGeometry({ x: 0, y: 0, width: 10.01, height: 10 });
    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates).toHaveBeenCalledTimes(1);
  });

  it('should include the viewport in every pushed batch', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates.mock.calls[0][0].viewport.innerWidth).toBe(
      window.innerWidth,
    );
  });

  it('should stop scheduling frames after the idle threshold', () => {
    const { tracker } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);

    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should resume scheduling after a window resize following an idle stop', () => {
    const { tracker } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    window.dispatchEvent(new Event('resize'));

    expect(geometryGlobals.getScheduledFrameCount()).toBe(1);
  });

  it('should push the resized viewport after visibility is restored', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    const initialInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      value: initialInnerWidth + 100,
      configurable: true,
    });

    pushGeometryUpdates.mockClear();
    document.dispatchEvent(new Event('visibilitychange'));
    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates).toHaveBeenCalledTimes(1);
    expect(pushGeometryUpdates.mock.calls[0][0].viewport.innerWidth).toBe(
      initialInnerWidth + 100,
    );

    Object.defineProperty(window, 'innerWidth', {
      value: initialInnerWidth,
      configurable: true,
    });
  });

  it('should resume scheduling when the resize observer fires', () => {
    const { tracker } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    geometryGlobals.triggerResizeObserver();

    expect(geometryGlobals.getScheduledFrameCount()).toBe(1);
  });

  it('should resume scheduling when the mutation observer fires', () => {
    const { tracker } = createArmedTracker();
    const rootContainer = document.createElement('div');
    document.body.append(rootContainer);
    tracker.setRoot(rootContainer);

    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    geometryGlobals.triggerMutationObserver();

    expect(geometryGlobals.getScheduledFrameCount()).toBe(1);
  });

  it('should refresh the font shorthand when a document style mutation marks the viewport dirty', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const rootContainer = document.createElement('div');
    document.body.append(rootContainer);
    tracker.setRoot(rootContainer);

    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    const getComputedStyle = jest
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ font: '700 20px Inter' } as CSSStyleDeclaration);

    pushGeometryUpdates.mockClear();
    geometryGlobals.triggerMutationObserver();
    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates).toHaveBeenCalledTimes(1);
    expect(
      pushGeometryUpdates.mock.calls[0][0].viewport.defaultFontShorthand,
    ).toBe('700 20px Inter');

    getComputedStyle.mockRestore();
  });

  it('should keep scheduling past the idle threshold while an animation runs inside the root', () => {
    const { tracker } = createArmedTracker();
    const rootContainer = document.createElement('div');
    document.body.append(rootContainer);
    tracker.setRoot(rootContainer);

    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
    rootContainer.append(observed.node);

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);

    observed.node.dispatchEvent(new Event('transitionrun', { bubbles: true }));
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(1);
  });

  it('should idle despite an animation outside the root', () => {
    const { tracker } = createArmedTracker();
    const rootContainer = document.createElement('div');
    const unrelatedContainer = document.createElement('div');
    document.body.append(rootContainer, unrelatedContainer);
    tracker.setRoot(rootContainer);

    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
    rootContainer.append(observed.node);

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);

    unrelatedContainer.dispatchEvent(
      new Event('transitionrun', { bubbles: true }),
    );
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should idle after a transitioning node is reparented outside the root before its end event', () => {
    const { tracker } = createArmedTracker();
    const rootContainer = document.createElement('div');
    const unrelatedContainer = document.createElement('div');
    document.body.append(rootContainer, unrelatedContainer);
    tracker.setRoot(rootContainer);

    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
    rootContainer.append(observed.node);

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);

    const transitioningNode = document.createElement('div');
    rootContainer.append(transitioningNode);
    transitioningNode.dispatchEvent(
      new Event('transitionrun', { bubbles: true }),
    );

    unrelatedContainer.append(transitioningNode);
    transitioningNode.dispatchEvent(
      new Event('transitionend', { bubbles: true }),
    );

    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should idle after a transitioning node is removed and never delivers its end event', () => {
    const { tracker } = createArmedTracker();
    const rootContainer = document.createElement('div');
    document.body.append(rootContainer);
    tracker.setRoot(rootContainer);

    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
    rootContainer.append(observed.node);

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);

    const transitioningNode = document.createElement('div');
    rootContainer.append(transitioningNode);
    transitioningNode.dispatchEvent(
      new Event('transitionrun', { bubbles: true }),
    );
    transitioningNode.remove();

    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should keep scheduling when an unrelated out-of-root animation ends during an in-root animation', () => {
    const { tracker } = createArmedTracker();
    const rootContainer = document.createElement('div');
    const unrelatedContainer = document.createElement('div');
    document.body.append(rootContainer, unrelatedContainer);
    tracker.setRoot(rootContainer);

    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
    rootContainer.append(observed.node);

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);

    observed.node.dispatchEvent(new Event('transitionrun', { bubbles: true }));
    unrelatedContainer.dispatchEvent(
      new Event('transitionend', { bubbles: true }),
    );

    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(1);
  });

  it('should keep scheduling for a long-running in-root animation past the time an old watchdog would expire', () => {
    const { tracker } = createArmedTracker();
    const rootContainer = document.createElement('div');
    document.body.append(rootContainer);
    tracker.setRoot(rootContainer);

    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });
    rootContainer.append(observed.node);

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);

    observed.node.dispatchEvent(new Event('transitionrun', { bubbles: true }));

    const nowSpy = jest
      .spyOn(performance, 'now')
      .mockImplementation(() => 60_000);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(1);

    nowSpy.mockRestore();
  });

  it('should cap the observed set at the configured maximum', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();

    const remoteElementIds = Array.from({ length: 10000 }, (_, index) =>
      String(index),
    );

    for (const remoteElementId of remoteElementIds) {
      const stub = geometryGlobals.createStubNode({
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      });
      tracker.registerNode(remoteElementId, stub.node);
    }

    tracker.observe(remoteElementIds);
    geometryGlobals.flushAnimationFrame();

    expect(
      Object.keys(pushGeometryUpdates.mock.calls[0][0].elements).length,
    ).toBe(500);
  });

  it('should not grow the observed set when the same ids are observed repeatedly', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });

    tracker.registerNode('1', stub.node);
    tracker.observe(['1']);
    tracker.observe(['1']);
    tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();

    expect(Object.keys(pushGeometryUpdates.mock.calls[0][0].elements)).toEqual([
      '1',
    ]);
  });

  it('should keep an id observed when its node unregisters', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });

    tracker.registerNode('1', stub.node);
    tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();

    tracker.unregisterNode('1', stub.node);
    stub.node.remove();
    geometryGlobals.flushAnimationFrame();

    tracker.registerNode('1', stub.node);
    document.body.append(stub.node);
    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates).toHaveBeenCalledTimes(3);
    expect(pushGeometryUpdates.mock.calls[2][0].elements['1'].width).toBe(1);
  });

  it('should push again when an id is re-observed after unobserve', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', stub.node);
    tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();
    expect(pushGeometryUpdates).toHaveBeenCalledTimes(1);

    tracker.unobserve(['1']);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);
    pushGeometryUpdates.mockClear();

    tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates).toHaveBeenCalledTimes(1);
    expect(pushGeometryUpdates.mock.calls[0][0].elements['1'].width).toBe(10);
  });

  it('should detach element wake sources when the last id is unobserved', () => {
    const { tracker } = createArmedTracker();
    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', stub.node);
    tracker.observe(['1']);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);
    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);

    document.dispatchEvent(new Event('scroll'));
    expect(geometryGlobals.getScheduledFrameCount()).toBe(1);

    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);
    tracker.unobserve(['1']);

    document.dispatchEvent(new Event('scroll'));
    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should carry the offset parent id when the parent is observed', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const parent = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    const child = geometryGlobals.createStubNode({
      x: 10,
      y: 10,
      width: 20,
      height: 20,
    });
    Object.defineProperty(child.node, 'offsetParent', { value: parent.node });
    Object.defineProperty(child.node, 'offsetTop', { value: 10 });
    Object.defineProperty(child.node, 'offsetLeft', { value: 10 });

    tracker.registerNode('1', parent.node);
    tracker.registerNode('2', child.node);
    tracker.observe(['1', '2']);
    geometryGlobals.flushAnimationFrame();

    const batch = pushGeometryUpdates.mock.calls[0][0];
    expect(batch.elements['2'].offsetParentRemoteElementId).toBe('1');
    expect(batch.elements['2'].offsetTop).toBe(10);
    expect(batch.elements['1'].offsetParentRemoteElementId).toBeNull();
  });

  it('should not carry the offset parent id when the parent is not observed', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const parent = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
    const child = geometryGlobals.createStubNode({
      x: 10,
      y: 10,
      width: 20,
      height: 20,
    });
    Object.defineProperty(child.node, 'offsetParent', { value: parent.node });

    tracker.registerNode('1', parent.node);
    tracker.registerNode('2', child.node);
    tracker.observe(['2']);
    geometryGlobals.flushAnimationFrame();

    const batch = pushGeometryUpdates.mock.calls[0][0];
    expect(batch.elements['2'].offsetParentRemoteElementId).toBeNull();
  });

  it('should expire an observed id whose node never registers', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1', '404']);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    const removalBatches = pushGeometryUpdates.mock.calls.filter(
      (call) => call[0].removedRemoteElementIds.length > 0,
    );

    expect(removalBatches).toHaveLength(1);
    expect(removalBatches[0][0].removedRemoteElementIds).toEqual(['404']);
  });

  it('should not expire an observed id that registers before the limit', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const anchor = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', anchor.node);
    tracker.observe(['1', '2']);
    flushFrames(5);

    const lateStub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 7,
      height: 7,
    });
    tracker.registerNode('2', lateStub.node);
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    for (const call of pushGeometryUpdates.mock.calls) {
      expect(call[0].removedRemoteElementIds).toEqual([]);
    }
    const lastPushWithLateNode = pushGeometryUpdates.mock.calls.find(
      (call) => call[0].elements['2'] !== undefined,
    );
    expect(lastPushWithLateNode?.[0].elements['2'].width).toBe(7);
  });

  it('should report a removed id exactly once', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });

    tracker.registerNode('1', stub.node);
    tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();

    tracker.unregisterNode('1', stub.node);
    flushFrames(3);

    const removalBatches = pushGeometryUpdates.mock.calls.filter(
      (call) => call[0].removedRemoteElementIds.length > 0,
    );

    expect(removalBatches).toHaveLength(1);
    expect(removalBatches[0][0].removedRemoteElementIds).toEqual(['1']);
  });

  it('should not report a removal for an id that was never measured', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();

    tracker.observe(['404']);
    flushFrames(3);

    for (const call of pushGeometryUpdates.mock.calls) {
      expect(call[0].removedRemoteElementIds).toEqual([]);
    }
  });

  it('should measure an id registered after it was observed', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();

    tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();

    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 7,
      height: 7,
    });
    tracker.registerNode('1', stub.node);
    geometryGlobals.flushAnimationFrame();

    const lastBatch =
      pushGeometryUpdates.mock.calls[pushGeometryUpdates.mock.calls.length - 1];
    expect(lastBatch[0].elements['1'].width).toBe(7);
  });

  it('should not evict a live node when a stale unregister for the same id arrives', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const staleStub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });
    const liveStub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 2,
      height: 2,
    });

    tracker.registerNode('1', liveStub.node);
    tracker.unregisterNode('1', staleStub.node);
    tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates.mock.calls[0][0].elements['1'].width).toBe(2);
  });

  it('should ignore non-array, non-string and over-long ids', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });

    tracker.registerNode('1', stub.node);
    tracker.observe('not-an-array');
    tracker.observe([42, null, 'x'.repeat(200)]);
    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates).not.toHaveBeenCalled();
  });

  it('should not push after reset and should be idempotent when reset twice', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();
    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });

    tracker.registerNode('1', stub.node);
    tracker.observe(['1']);
    tracker.reset();
    tracker.reset();

    geometryGlobals.flushAnimationFrame();

    expect(pushGeometryUpdates).not.toHaveBeenCalled();
  });

  it('should keep two trackers independent', () => {
    const first = createArmedTracker();
    const second = createArmedTracker();

    const firstStub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 11,
      height: 11,
    });
    const secondStub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 22,
      height: 22,
    });

    first.tracker.registerNode('1', firstStub.node);
    second.tracker.registerNode('1', secondStub.node);

    first.tracker.observe(['1']);
    geometryGlobals.flushAnimationFrame();

    expect(first.pushGeometryUpdates).toHaveBeenCalledTimes(1);
    expect(first.pushGeometryUpdates.mock.calls[0][0].elements['1'].width).toBe(
      11,
    );
    expect(second.pushGeometryUpdates).not.toHaveBeenCalled();
  });
});
