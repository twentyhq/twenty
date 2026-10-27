import { OUTSIDE_PRESS_EVENT_TYPES } from '@/constants/OutsidePressEventTypes';
import { trackHostOutsidePress } from '@/host/events/utils/trackHostOutsidePress';
import { findRemoteElementIdContainingNode } from '@/host/geometry/utils/findRemoteElementIdContainingNode';

const createOutsidePressTracker = ({
  ownedElements = [],
  hasActivePointerCaptureForEvent = () => false,
}: {
  ownedElements?: Element[];
  hasActivePointerCaptureForEvent?: (event: object) => boolean;
} = {}) => {
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
    hasActivePointerCaptureForEvent,
  });

  return { pushOutsidePressEvent, dispose };
};

const createPress = (type: string) =>
  new MouseEvent(type, { bubbles: true, detail: 1 });

const createPressAtHorizontalOffset = ({
  type,
  offsetX,
}: {
  type: string;
  offsetX: number;
}) => {
  const event = createPress(type);

  Object.defineProperty(event, 'offsetX', { value: offsetX });

  return event;
};

const readForwardedEventTypes = (pushOutsidePressEvent: jest.Mock) =>
  pushOutsidePressEvent.mock.calls.map(([eventData]) => eventData.type);

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
    const { pushOutsidePressEvent, dispose } = createOutsidePressTracker({
      ownedElements: [root, portal],
    });

    try {
      child.dispatchEvent(createPress('click'));
      portalChild.dispatchEvent(createPress('click'));

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
        outsideButton.dispatchEvent(createPress(eventType));
      }
      outsideButton.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true }),
      );
      outsideButton.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
      );

      expect(readForwardedEventTypes(pushOutsidePressEvent)).toEqual(
        OUTSIDE_PRESS_EVENT_TYPES,
      );
    } finally {
      dispose();
    }
  });

  it('skips clicks without a press, such as keyboard activation of a host control', () => {
    const outsideButton = document.createElement('button');
    document.body.append(outsideButton);
    const { pushOutsidePressEvent, dispose } = createOutsidePressTracker();

    try {
      outsideButton.dispatchEvent(
        new MouseEvent('click', { bubbles: true, detail: 0 }),
      );

      expect(pushOutsidePressEvent).not.toHaveBeenCalled();
    } finally {
      dispose();
    }
  });

  it('skips presses on a host scrollbar', () => {
    const scrollContainer = document.createElement('div');
    scrollContainer.style.overflowY = 'auto';
    Object.defineProperties(scrollContainer, {
      clientWidth: { value: 100 },
      offsetWidth: { value: 115 },
      clientHeight: { value: 100 },
      scrollHeight: { value: 400 },
    });
    document.body.append(scrollContainer);
    const { pushOutsidePressEvent, dispose } = createOutsidePressTracker();

    try {
      scrollContainer.dispatchEvent(
        createPressAtHorizontalOffset({ type: 'mousedown', offsetX: 105 }),
      );
      scrollContainer.dispatchEvent(
        createPressAtHorizontalOffset({ type: 'mousedown', offsetX: 50 }),
      );

      expect(readForwardedEventTypes(pushOutsidePressEvent)).toEqual([
        'mousedown',
      ]);
    } finally {
      dispose();
    }
  });

  it('keeps the compatibility events after a captured release off the outside path', () => {
    const outsideButton = document.createElement('button');
    document.body.append(outsideButton);
    const firstCapturedRelease = createPress('pointerup');
    const secondCapturedRelease = createPress('pointerup');
    const capturedReleases = new Set<object>([
      firstCapturedRelease,
      secondCapturedRelease,
    ]);
    const { pushOutsidePressEvent, dispose } = createOutsidePressTracker({
      hasActivePointerCaptureForEvent: (event) => capturedReleases.has(event),
    });

    try {
      outsideButton.dispatchEvent(firstCapturedRelease);
      outsideButton.dispatchEvent(createPress('mouseup'));
      outsideButton.dispatchEvent(createPress('click'));
      outsideButton.dispatchEvent(createPress('click'));
      outsideButton.dispatchEvent(secondCapturedRelease);
      outsideButton.dispatchEvent(createPress('pointerdown'));
      outsideButton.dispatchEvent(createPress('mouseup'));

      expect(readForwardedEventTypes(pushOutsidePressEvent)).toEqual([
        'click',
        'pointerdown',
        'mouseup',
      ]);
    } finally {
      dispose();
    }
  });

  it('keeps renderer ownership and teardown independent', () => {
    const firstButton = document.createElement('button');
    const secondButton = document.createElement('button');
    document.body.append(firstButton, secondButton);
    const firstTracker = createOutsidePressTracker({
      ownedElements: [firstButton],
    });
    const secondTracker = createOutsidePressTracker({
      ownedElements: [secondButton],
    });

    try {
      firstButton.dispatchEvent(createPress('click'));
      expect(firstTracker.pushOutsidePressEvent).not.toHaveBeenCalled();
      expect(secondTracker.pushOutsidePressEvent).toHaveBeenCalledTimes(1);

      secondTracker.dispose();
      document.body.dispatchEvent(createPress('click'));
      expect(firstTracker.pushOutsidePressEvent).toHaveBeenCalledTimes(1);
      expect(secondTracker.pushOutsidePressEvent).toHaveBeenCalledTimes(1);
    } finally {
      firstTracker.dispose();
      secondTracker.dispose();
    }
  });
});
