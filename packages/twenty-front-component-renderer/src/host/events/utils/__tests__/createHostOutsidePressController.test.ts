import { createHostOutsidePressController } from '@/host/events/utils/createHostOutsidePressController';
import { createGeometryTracker } from '@/host/geometry/utils/createGeometryTracker';
import { createHostPointerCaptureControllerStub } from '@/testing/createHostPointerCaptureControllerStub';

const createOutsidePressControllerFixture = () => {
  const ownedButton = document.createElement('button');
  const outsideButton = document.createElement('button');
  const geometryTracker = createGeometryTracker();

  document.body.append(ownedButton, outsideButton);
  geometryTracker.registerNode('owned-button', ownedButton);

  return {
    ownedButton,
    outsideButton,
    controller: createHostOutsidePressController({
      geometryTracker,
      pointerCaptureController: createHostPointerCaptureControllerStub(),
    }),
    pushOutsidePressEvent: jest.fn(),
  };
};

const clickElement = (element: Element) => {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
};

describe('createHostOutsidePressController', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('forwards outside presses only while the worker observes them', () => {
    const { ownedButton, outsideButton, controller, pushOutsidePressEvent } =
      createOutsidePressControllerFixture();

    try {
      controller.setPushOutsidePressEvent(pushOutsidePressEvent);
      clickElement(outsideButton);

      expect(pushOutsidePressEvent).not.toHaveBeenCalled();

      controller.observeOutsidePresses();
      controller.observeOutsidePresses();
      clickElement(ownedButton);
      clickElement(outsideButton);

      expect(pushOutsidePressEvent).toHaveBeenCalledTimes(1);

      controller.unobserveOutsidePresses();
      clickElement(outsideButton);

      expect(pushOutsidePressEvent).toHaveBeenCalledTimes(1);
    } finally {
      controller.reset();
    }
  });

  it('waits for the push function and forgets the observation on reset', () => {
    const { outsideButton, controller, pushOutsidePressEvent } =
      createOutsidePressControllerFixture();

    try {
      controller.observeOutsidePresses();
      controller.setPushOutsidePressEvent(pushOutsidePressEvent);
      clickElement(outsideButton);

      expect(pushOutsidePressEvent).toHaveBeenCalledTimes(1);

      controller.reset();
      controller.setPushOutsidePressEvent(pushOutsidePressEvent);
      clickElement(outsideButton);

      expect(pushOutsidePressEvent).toHaveBeenCalledTimes(1);
    } finally {
      controller.reset();
    }
  });
});
