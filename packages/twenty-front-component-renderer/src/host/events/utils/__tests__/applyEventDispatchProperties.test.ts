import { type SerializedEventData } from '@/types/SerializedEventData';

import { applyEventDispatchProperties } from '../applyEventDispatchProperties';

const TARGET = {};
const RELATED_TARGET = {};
const NODE_OUTSIDE_FRONT_COMPONENT = {};

const findRemoteElementIdContainingNode = (node: unknown) =>
  new Map<unknown, string>([
    [TARGET, 'target-id'],
    [RELATED_TARGET, 'related-target-id'],
  ]).get(node);

const applyToHostEvent = (hostEvent: Record<string, unknown>) => {
  const serializedEvent: SerializedEventData = { type: String(hostEvent.type) };

  applyEventDispatchProperties({
    serializedEvent,
    hostEvent,
    findRemoteElementIdContainingNode,
  });

  return serializedEvent;
};

describe('applyEventDispatchProperties', () => {
  it('should mark a bubbling host event and identify its target and related target', () => {
    expect(
      applyToHostEvent({
        type: 'mouseover',
        bubbles: true,
        target: TARGET,
        relatedTarget: RELATED_TARGET,
      }),
    ).toEqual({
      type: 'mouseover',
      bubbles: true,
      targetRemoteElementId: 'target-id',
      relatedTargetRemoteElementId: 'related-target-id',
    });
  });

  it.each(['mouseenter', 'mouseleave', 'pointerenter', 'pointerleave'])(
    'should keep %s on its listening element while identifying its related target',
    (type) => {
      expect(
        applyToHostEvent({
          type,
          bubbles: true,
          target: TARGET,
          relatedTarget: RELATED_TARGET,
        }),
      ).toEqual({ type, relatedTargetRemoteElementId: 'related-target-id' });
    },
  );

  it('should not mark a host event that does not bubble', () => {
    expect(
      applyToHostEvent({ type: 'scroll', bubbles: false, target: TARGET }),
    ).toEqual({ type: 'scroll' });
  });

  it('should leave out targets outside the front component', () => {
    expect(
      applyToHostEvent({
        type: 'focusout',
        bubbles: true,
        target: TARGET,
        relatedTarget: NODE_OUTSIDE_FRONT_COMPONENT,
      }),
    ).toEqual({
      type: 'focusout',
      bubbles: true,
      targetRemoteElementId: 'target-id',
    });
  });

  it('should still mark a bubbling host event when no remote element ids can be resolved', () => {
    const serializedEvent: SerializedEventData = { type: 'click' };

    applyEventDispatchProperties({
      serializedEvent,
      hostEvent: { type: 'click', bubbles: true, target: TARGET },
    });

    expect(serializedEvent).toEqual({ type: 'click', bubbles: true });
  });
});
