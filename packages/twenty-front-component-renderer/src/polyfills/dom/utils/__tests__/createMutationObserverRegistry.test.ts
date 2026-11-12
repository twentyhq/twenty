import { type MutationRecordSink } from '@/polyfills/dom/types/MutationRecordSink';
import { type WorkerMutationRecord } from '@/polyfills/dom/types/WorkerMutationRecord';
import { createMutationObserverRegistry } from '@/polyfills/dom/utils/createMutationObserverRegistry';
import { createMutationRecord } from '@/polyfills/dom/utils/createMutationRecord';

const createNode = (parentNode: Node | null = null) => {
  const node = document.createElement('div');

  parentNode?.appendChild(node);

  return node;
};

const createFakeSink = () => {
  const records: WorkerMutationRecord[] = [];
  const scheduleDelivery = jest.fn();

  const sink: MutationRecordSink = {
    enqueueMutationRecord: (record) => {
      records.push(record);
    },
    scheduleDelivery,
  };

  return { sink, records, scheduleDelivery };
};

describe('createMutationObserverRegistry', () => {
  it('registers a transient observation once per detachment batch', () => {
    const registry = createMutationObserverRegistry();
    const { sink, scheduleDelivery } = createFakeSink();

    const formerParent = createNode();
    const detachedNode = createNode();

    registry.registerObservation({
      target: formerParent,
      sink,
      options: { childList: true, subtree: true },
    });

    registry.registerTransientObservations({ detachedNode, formerParent });
    registry.registerTransientObservations({ detachedNode, formerParent });
    registry.registerTransientObservations({ detachedNode, formerParent });

    expect(scheduleDelivery).toHaveBeenCalledTimes(1);
  });

  it('registers a transient observation again after the observer took delivery', () => {
    const registry = createMutationObserverRegistry();
    const { sink, scheduleDelivery } = createFakeSink();

    const formerParent = createNode();
    const detachedNode = createNode();

    registry.registerObservation({
      target: formerParent,
      sink,
      options: { childList: true, subtree: true },
    });

    registry.registerTransientObservations({ detachedNode, formerParent });
    registry.clearTransientObservations({ sink });
    registry.registerTransientObservations({ detachedNode, formerParent });

    expect(scheduleDelivery).toHaveBeenCalledTimes(2);
  });

  it('keeps one transient observation per distinct options object of the same observer', () => {
    const registry = createMutationObserverRegistry();
    const { sink, records } = createFakeSink();

    const root = createNode();
    const formerParent = createNode(root);
    const detachedNode = createNode();

    registry.registerObservation({
      target: root,
      sink,
      options: { childList: true, subtree: true },
    });
    registry.registerObservation({
      target: formerParent,
      sink,
      options: { attributes: true, subtree: true },
    });

    registry.registerTransientObservations({ detachedNode, formerParent });

    registry.broadcastMutationRecord({
      record: createMutationRecord({
        type: 'attributes',
        target: detachedNode,
        attributeName: 'data-open',
      }),
      oldValue: 'true',
    });
    registry.broadcastMutationRecord({
      record: createMutationRecord({
        type: 'childList',
        target: detachedNode,
        addedNodes: [createNode()],
      }),
      oldValue: null,
    });

    expect(records.map((record) => record.type)).toEqual([
      'attributes',
      'childList',
    ]);
  });

  it('gives each sink its own added node list', () => {
    const registry = createMutationObserverRegistry();
    const firstSink = createFakeSink();
    const secondSink = createFakeSink();

    const target = createNode();
    const addedNode = createNode();

    registry.registerObservation({
      target,
      sink: firstSink.sink,
      options: { childList: true },
    });
    registry.registerObservation({
      target,
      sink: secondSink.sink,
      options: { childList: true },
    });

    registry.broadcastMutationRecord({
      record: createMutationRecord({
        type: 'childList',
        target,
        addedNodes: [addedNode],
      }),
      oldValue: null,
    });

    expect(firstSink.records[0].addedNodes).not.toBe(
      secondSink.records[0].addedNodes,
    );
    expect(firstSink.records[0].addedNodes).toEqual([addedNode]);
    expect(secondSink.records[0].addedNodes).toEqual([addedNode]);
  });

  it('stops broadcasting after the last observation was unregistered', () => {
    const registry = createMutationObserverRegistry();
    const { sink, records } = createFakeSink();

    const target = createNode();

    registry.registerObservation({
      target,
      sink,
      options: { childList: true },
    });
    registry.unregisterObservations({ targets: [target], sink });

    registry.broadcastMutationRecord({
      record: createMutationRecord({
        type: 'childList',
        target,
        addedNodes: [createNode()],
      }),
      oldValue: null,
    });

    expect(records).toHaveLength(0);
  });

  it('reports whether any observation is registered', () => {
    const registry = createMutationObserverRegistry();
    const { sink } = createFakeSink();

    const target = createNode();

    expect(registry.hasObservations()).toBe(false);

    registry.registerObservation({
      target,
      sink,
      options: { childList: true },
    });

    expect(registry.hasObservations()).toBe(true);

    registry.unregisterObservations({ targets: [target], sink });

    expect(registry.hasObservations()).toBe(false);
  });
});
