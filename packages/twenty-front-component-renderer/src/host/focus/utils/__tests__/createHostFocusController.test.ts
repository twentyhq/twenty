import { createGeometryTracker } from '@/host/geometry/utils/createGeometryTracker';

import { createHostFocusController } from '../createHostFocusController';

const createFocusFixture = () => {
  const geometryTracker = createGeometryTracker();

  return {
    geometryTracker,
    controller: createHostFocusController({ geometryTracker }),
  };
};

describe('createHostFocusController', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should apply only the latest pending focus request as elements mount', () => {
    const { geometryTracker, controller } = createFocusFixture();
    const first = document.createElement('button');
    const second = document.createElement('button');

    document.body.append(first, second);
    controller.callFocusMethod({
      remoteElementId: 'first',
      methodName: 'focus',
    });
    controller.callFocusMethod({
      remoteElementId: 'second',
      methodName: 'focus',
    });
    geometryTracker.registerNode('first', first);
    controller.retryPendingFocus();
    expect(document.activeElement).toBe(document.body);
    geometryTracker.registerNode('second', second);
    controller.retryPendingFocus();
    expect(document.activeElement).toBe(second);
  });

  it('should cancel pending focus when the same element is blurred', () => {
    const { geometryTracker, controller } = createFocusFixture();
    const button = document.createElement('button');

    document.body.append(button);
    controller.callFocusMethod({
      remoteElementId: 'button',
      methodName: 'focus',
    });
    controller.callFocusMethod({
      remoteElementId: 'button',
      methodName: 'blur',
    });
    geometryTracker.registerNode('button', button);
    controller.retryPendingFocus();

    expect(document.activeElement).toBe(document.body);
  });

  it('should clear pending focus on reset', () => {
    const { geometryTracker, controller } = createFocusFixture();
    const button = document.createElement('button');

    document.body.append(button);
    controller.callFocusMethod({
      remoteElementId: 'button',
      methodName: 'focus',
    });
    controller.reset();
    geometryTracker.registerNode('button', button);
    controller.retryPendingFocus();

    expect(document.activeElement).toBe(document.body);
  });

  it('should stop using an unmounted element', () => {
    const { geometryTracker, controller } = createFocusFixture();
    const button = document.createElement('button');
    const focus = jest.spyOn(button, 'focus');

    document.body.append(button);
    geometryTracker.registerNode('button', button);
    geometryTracker.unregisterNode('button', button);
    controller.callFocusMethod({
      remoteElementId: 'button',
      methodName: 'focus',
    });

    expect(focus).not.toHaveBeenCalled();
  });
});
