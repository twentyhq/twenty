import { OUTSIDE_PRESS_EVENT_TYPES } from '@/constants/OutsidePressEventTypes';
import { trackHostOutsidePress } from '@/host/events/utils/trackHostOutsidePress';
import { findRemoteElementIdContainingNode } from '@/host/geometry/utils/findRemoteElementIdContainingNode';

const createOutsidePressTracker = (ownedElements: Element[] = []) => {
  const remoteElementIdByRegisteredNode = new WeakMap<object, string>();

  for (const element of ownedElements) {
    remoteElementIdByRegisteredNode.set(element, 'owned-element');
  }

  const pushOutsidePressEvent = jest.fn();
  const dispose = trackHostOutsidePress({
    documentTarget: document,
    findRemoteElementIdContainingNode: (node) =>
      findRemoteElementIdContainingNode({
        node,
        remoteElementIdByRegisteredNode,
      }),
    pushOutsidePressEvent,
    hasActivePointerCaptureForEvent: () => false,
  });

  return { pushOutsidePressEvent, dispose };
};

describe('trackHostOutsidePress', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('forwards press metadata without exposing an outside control or its coordinates', () => {
    const outsideInput = document.createElement('input');
    outsideInput.value = 'private host value';
    document.body.append(outsideInput);
    const { pushOutsidePressEvent, dispose } = createOutsidePressTracker();
    const event = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: 1,
      detail: 1,
      clientX: 420,
      clientY: 240,
      altKey: true,
    });

    try {
      outsideInput.dispatchEvent(event);

      expect(pushOutsidePressEvent.mock.calls).toEqual([
        [
          {
            type: 'mousedown',
            button: 0,
            buttons: 1,
            detail: 1,
            pointerType: 'mouse',
          },
        ],
      ]);
      expect(event.defaultPrevented).toBe(false);
      expect(outsideInput.value).toBe('private host value');
    } finally {
      dispose();
    }
  });

  it('leaves owned descendants and portal targets on their existing event path', () => {
    const root = document.createElement('div');
    const portal = document.createElement('div');
    const child = document.createElement('button');
    const portalChild = document.createElement('button');
    root.append(child);
    portal.append(portalChild);
    document.body.append(root, portal);
    const { pushOutsidePressEvent, dispose } = createOutsidePressTracker([
      root,
      portal,
    ]);

    try {
      child.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      portalChild.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(pushOutsidePressEvent).not.toHaveBeenCalled();
    } finally {
      dispose();
    }
  });

  it('forwards the press sequence during capture without forwarding unrelated events', () => {
    const outsideButton = document.createElement('button');
    document.body.append(outsideButton);
    const { pushOutsidePressEvent, dispose } = createOutsidePressTracker();

    try {
      for (const eventType of OUTSIDE_PRESS_EVENT_TYPES) {
        outsideButton.addEventListener(eventType, (event) =>
          event.stopPropagation(),
        );
        outsideButton.dispatchEvent(
          new MouseEvent(eventType, { bubbles: true }),
        );
      }
      outsideButton.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true }),
      );
      outsideButton.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
      );

      expect(
        pushOutsidePressEvent.mock.calls.map(([eventData]) => eventData.type),
      ).toEqual(OUTSIDE_PRESS_EVENT_TYPES);
    } finally {
      dispose();
    }
  });

  it('keeps renderer ownership and teardown independent', () => {
    const firstButton = document.createElement('button');
    const secondButton = document.createElement('button');
    document.body.append(firstButton, secondButton);
    const firstTracker = createOutsidePressTracker([firstButton]);
    const secondTracker = createOutsidePressTracker([secondButton]);

    try {
      firstButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(firstTracker.pushOutsidePressEvent).not.toHaveBeenCalled();
      expect(secondTracker.pushOutsidePressEvent).toHaveBeenCalledTimes(1);

      secondTracker.dispose();
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(firstTracker.pushOutsidePressEvent).toHaveBeenCalledTimes(1);
      expect(secondTracker.pushOutsidePressEvent).toHaveBeenCalledTimes(1);
    } finally {
      firstTracker.dispose();
      secondTracker.dispose();
    }
  });
});
