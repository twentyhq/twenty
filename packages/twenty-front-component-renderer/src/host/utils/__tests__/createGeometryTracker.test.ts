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
    createGeometryTracker();

    expect(geometryGlobals.getScheduledFrameCount()).toBe(0);
  });

  it('should not schedule a frame when observing before being armed', () => {
    const tracker = createGeometryTracker();

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

  it('should keep scheduling past the idle threshold while an animation is in flight', () => {
    const { tracker } = createArmedTracker();
    const observed = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    tracker.registerNode('1', observed.node);
    tracker.observe(['1']);

    document.dispatchEvent(new Event('transitionrun', { bubbles: true }));
    flushFrames(GEOMETRY_IDLE_FRAME_THRESHOLD + 2);

    expect(geometryGlobals.getScheduledFrameCount()).toBe(1);
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

  it('should cap measure at the configured maximum and not enlarge the observed set', () => {
    const { tracker, pushGeometryUpdates } = createArmedTracker();

    const remoteElementIds = Array.from({ length: 100 }, (_, index) =>
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

    const result = tracker.measure(remoteElementIds);

    expect(Object.keys(result.elements)).toHaveLength(50);

    geometryGlobals.flushAnimationFrame();
    expect(pushGeometryUpdates).not.toHaveBeenCalled();
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

  it('should return an empty measure result after reset', () => {
    const { tracker } = createArmedTracker();
    const stub = geometryGlobals.createStubNode({
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    });

    tracker.registerNode('1', stub.node);
    tracker.reset();

    expect(tracker.measure(['1']).elements).toEqual({});
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
