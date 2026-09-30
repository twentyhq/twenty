import { createHostFocusController } from '../createHostFocusController';

describe('createHostFocusController', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should apply only the latest pending focus request as elements mount', () => {
    const controller = createHostFocusController();
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
    controller.registerElement({ remoteElementId: 'first', element: first });
    expect(document.activeElement).toBe(document.body);
    controller.registerElement({ remoteElementId: 'second', element: second });
    expect(document.activeElement).toBe(second);
  });

  it('should cancel pending focus when the same element is blurred', () => {
    const controller = createHostFocusController();
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
    controller.registerElement({ remoteElementId: 'button', element: button });

    expect(document.activeElement).toBe(document.body);
  });

  it('should clear pending focus and registered elements on reset', () => {
    const controller = createHostFocusController();
    const first = document.createElement('button');
    const second = document.createElement('button');

    document.body.append(first, second);
    controller.registerElement({ remoteElementId: 'first', element: first });
    controller.callFocusMethod({
      remoteElementId: 'second',
      methodName: 'focus',
    });
    controller.reset();
    controller.registerElement({ remoteElementId: 'second', element: second });
    expect(document.activeElement).toBe(document.body);

    controller.callFocusMethod({
      remoteElementId: 'first',
      methodName: 'focus',
    });
    expect(document.activeElement).toBe(document.body);
  });

  it('should stop using an unmounted element', () => {
    const controller = createHostFocusController();
    const button = document.createElement('button');
    const focus = jest.spyOn(button, 'focus');

    document.body.append(button);
    controller.registerElement({ remoteElementId: 'button', element: button });
    controller.unregisterElement({
      remoteElementId: 'button',
      element: button,
    });
    controller.callFocusMethod({
      remoteElementId: 'button',
      methodName: 'focus',
    });

    expect(focus).not.toHaveBeenCalled();
  });
});
