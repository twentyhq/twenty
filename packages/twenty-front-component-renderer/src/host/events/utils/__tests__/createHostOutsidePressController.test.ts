import { createHostOutsidePressController } from '@/host/events/utils/createHostOutsidePressController';
import { wrapEventHandler } from '@/host/events/utils/wrapEventHandler';
import { createGeometryTracker } from '@/host/geometry/utils/createGeometryTracker';
import { createHostPointerCaptureControllerStub } from '@/testing/createHostPointerCaptureControllerStub';

const createOutsidePressControllerFixture = () => {
  const ownedButton = document.createElement('button');
  const outsideButton = document.createElement('button');
  const geometryTracker = createGeometryTracker();
  const pointerCaptureController = createHostPointerCaptureControllerStub();

  document.body.append(ownedButton, outsideButton);
  geometryTracker.registerNode('owned-button', ownedButton);

  return {
    ownedButton,
    outsideButton,
    pointerCaptureController,
    controller: createHostOutsidePressController({
      geometryTracker,
      pointerCaptureController,
    }),
    pressEventTransport: {
      pushOutsidePressEvent: jest.fn(),
      pushOwnedPressEvent: jest.fn(),
    },
  };
};

const clickElement = (element: Element) => {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
};

describe('createHostOutsidePressController', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('forwards outside presses only while the worker observes them', () => {
    const { ownedButton, outsideButton, controller, pressEventTransport } =
      createOutsidePressControllerFixture();

    try {
      controller.setPressEventTransport(pressEventTransport);
      clickElement(outsideButton);

      expect(pressEventTransport.pushOutsidePressEvent).not.toHaveBeenCalled();

      controller.observeOutsidePresses();
      controller.observeOutsidePresses();
      clickElement(ownedButton);
      clickElement(outsideButton);

      expect(pressEventTransport.pushOutsidePressEvent).toHaveBeenCalledTimes(
        1,
      );

      controller.unobserveOutsidePresses();
      clickElement(outsideButton);

      expect(pressEventTransport.pushOutsidePressEvent).toHaveBeenCalledTimes(
        1,
      );
    } finally {
      controller.reset();
    }
  });

  it('waits for the press transport and forgets the observation on reset', () => {
    const { outsideButton, controller, pressEventTransport } =
      createOutsidePressControllerFixture();

    try {
      controller.observeOutsidePresses();
      controller.setPressEventTransport(pressEventTransport);
      clickElement(outsideButton);

      expect(pressEventTransport.pushOutsidePressEvent).toHaveBeenCalledTimes(
        1,
      );

      controller.reset();
      controller.setPressEventTransport(pressEventTransport);
      clickElement(outsideButton);

      expect(pressEventTransport.pushOutsidePressEvent).toHaveBeenCalledTimes(
        1,
      );
    } finally {
      controller.reset();
    }
  });

  it('forwards an owned press that no element handler forwarded, at its target, while the worker observes', () => {
    const { ownedButton, controller, pressEventTransport } =
      createOutsidePressControllerFixture();
    const hostEvent = {
      type: 'pointerdown',
      bubbles: true,
      target: ownedButton,
      clientX: 12,
    };

    try {
      controller.setPressEventTransport(pressEventTransport);
      controller.forwardUnhandledOwnedPress(hostEvent);

      expect(pressEventTransport.pushOwnedPressEvent).not.toHaveBeenCalled();

      controller.observeOutsidePresses();
      controller.forwardUnhandledOwnedPress(hostEvent);
      controller.forwardUnhandledOwnedPress(hostEvent);

      expect(pressEventTransport.pushOwnedPressEvent.mock.calls).toEqual([
        [
          expect.objectContaining({
            type: 'pointerdown',
            bubbles: true,
            targetRemoteElementId: 'owned-button',
            clientX: 12,
          }),
        ],
      ]);
    } finally {
      controller.reset();
    }
  });

  it('leaves presses that an element handler or a capture session forwarded, and presses outside the component', () => {
    const {
      ownedButton,
      outsideButton,
      pointerCaptureController,
      controller,
      pressEventTransport,
    } = createOutsidePressControllerFixture();
    const remoteListener = jest.fn();
    const forwardedHostEvent = {
      type: 'click',
      bubbles: true,
      target: ownedButton,
    };

    try {
      controller.setPressEventTransport(pressEventTransport);
      controller.observeOutsidePresses();
      wrapEventHandler({ remoteListener })(forwardedHostEvent);
      controller.forwardUnhandledOwnedPress(forwardedHostEvent);
      jest
        .mocked(pointerCaptureController.claimPointerEventForwarding)
        .mockReturnValueOnce(false);
      controller.forwardUnhandledOwnedPress({
        type: 'pointerup',
        bubbles: true,
        target: ownedButton,
      });
      controller.forwardUnhandledOwnedPress({
        type: 'click',
        bubbles: true,
        target: outsideButton,
      });

      expect(remoteListener).toHaveBeenCalledTimes(1);
      expect(pressEventTransport.pushOwnedPressEvent).not.toHaveBeenCalled();
    } finally {
      controller.reset();
    }
  });
});
