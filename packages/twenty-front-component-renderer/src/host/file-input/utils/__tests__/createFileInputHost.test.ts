import { createGeometryTracker } from '@/host/geometry/utils/createGeometryTracker';

import { createFileInputHost } from '../createFileInputHost';

const userActivation = { isActive: true };

const createFixture = () => {
  const geometryTracker = createGeometryTracker();
  const host = createFileInputHost({ geometryTracker });
  const button = document.createElement('button');
  const input = document.createElement('input');
  input.type = 'file';
  document.body.append(button, input);
  geometryTracker.registerNode('button', button);
  geometryTracker.registerNode('input', input);
  const click = jest.spyOn(input, 'click').mockImplementation(() => undefined);
  const trustedClick = {
    type: 'click',
    isTrusted: true,
    target: button,
  };
  return { host, input, button, click, trustedClick };
};

describe('createFileInputHost', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    userActivation.isActive = true;
    Object.defineProperty(navigator, 'userActivation', {
      configurable: true,
      value: userActivation,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.replaceChildren();
  });

  it('requires a trusted owned click and active browser user activation', () => {
    const { host, button, trustedClick } = createFixture();
    expect(host.captureActivation(new MouseEvent('click'))).toBeUndefined();
    expect(
      host.captureActivation({
        ...trustedClick,
        target: document.body,
      }),
    ).toBeUndefined();
    expect(
      host.captureActivation({
        type: 'keydown',
        isTrusted: true,
        target: button,
      }),
    ).toBeUndefined();
    userActivation.isActive = false;
    expect(host.captureActivation(trustedClick)).toBeUndefined();
  });

  it('opens only an owned file input and consumes the activation once', () => {
    const { host, click, trustedClick } = createFixture();
    const activationId = host.captureActivation(trustedClick);
    host.openFilePicker({ remoteElementId: 'input', activationId });
    host.openFilePicker({ remoteElementId: 'input', activationId });
    expect(click).toHaveBeenCalledTimes(1);
  });

  it.each(['disabled', 'detached', 'non-file', 'unregistered', 'inactive'])(
    'rejects a %s destination even with a matching activation',
    (state) => {
      const { host, input, click, trustedClick } = createFixture();
      const activationId = host.captureActivation(trustedClick);
      if (state === 'disabled') input.disabled = true;
      if (state === 'detached') input.remove();
      if (state === 'non-file') input.type = 'text';
      if (state === 'inactive') userActivation.isActive = false;
      host.openFilePicker({
        remoteElementId: state === 'unregistered' ? 'missing' : 'input',
        activationId,
      });
      expect(click).not.toHaveBeenCalled();
    },
  );

  it('does not share activation between renderer instances', () => {
    const first = createFixture();
    const second = createFixture();
    const activationId = first.host.captureActivation(first.trustedClick);
    second.host.openFilePicker({ remoteElementId: 'input', activationId });
    first.host.openFilePicker({ remoteElementId: 'input', activationId });
    expect(second.click).not.toHaveBeenCalled();
    expect(first.click).toHaveBeenCalledTimes(1);
  });

  it.each(['replacement', 'timeout', 'teardown'])(
    'invalidates activation on %s',
    (reason) => {
      const { host, click, trustedClick } = createFixture();
      const activationId = host.captureActivation(trustedClick);
      if (reason === 'replacement') host.captureActivation(trustedClick);
      if (reason === 'timeout') jest.runOnlyPendingTimers();
      if (reason === 'teardown') host.reset();
      host.openFilePicker({ remoteElementId: 'input', activationId });
      expect(click).not.toHaveBeenCalled();
      host.reset();
    },
  );
});
