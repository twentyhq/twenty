import { wrapEventHandler } from '../wrapEventHandler';

const createNestedWrappedHandlers = () => {
  const innerRemoteListener = jest.fn();
  const outerRemoteListener = jest.fn();

  return {
    innerRemoteListener,
    outerRemoteListener,
    innerHandler: wrapEventHandler({ remoteListener: innerRemoteListener }),
    outerHandler: wrapEventHandler({ remoteListener: outerRemoteListener }),
  };
};

describe('wrapEventHandler', () => {
  it('should invoke the remote listener with the serialized event', () => {
    const remoteListener = jest.fn();

    wrapEventHandler({ remoteListener })({ type: 'click', clientX: 3 });

    expect(remoteListener).toHaveBeenCalledWith({ type: 'click', clientX: 3 });
  });

  it('should serialize away non-whitelisted event fields before calling the remote listener', () => {
    const remoteListener = jest.fn();

    wrapEventHandler({ remoteListener })({ type: 'click', secret: 'leaked' });

    expect(remoteListener).toHaveBeenCalledWith({ type: 'click' });
  });

  it('should forward a bubbling host event once, from the innermost listening element', () => {
    const {
      innerRemoteListener,
      outerRemoteListener,
      innerHandler,
      outerHandler,
    } = createNestedWrappedHandlers();
    const hostEvent = { type: 'click', bubbles: true };

    innerHandler(hostEvent);
    outerHandler(hostEvent);

    expect(innerRemoteListener).toHaveBeenCalledWith({
      type: 'click',
      bubbles: true,
    });
    expect(outerRemoteListener).not.toHaveBeenCalled();
  });

  it.each([
    ['mouseenter', true],
    ['pointerleave', true],
    ['scroll', false],
  ])('should forward %s to every listening element', (type, bubbles) => {
    const {
      innerRemoteListener,
      outerRemoteListener,
      innerHandler,
      outerHandler,
    } = createNestedWrappedHandlers();
    const hostEvent = { type, bubbles };

    innerHandler(hostEvent);
    outerHandler(hostEvent);

    expect(innerRemoteListener).toHaveBeenCalledWith({ type });
    expect(outerRemoteListener).toHaveBeenCalledWith({ type });
  });

  it('should let the next listening element forward when the innermost remote listener is gone', () => {
    const outerRemoteListener = jest.fn();
    const innerHandler = wrapEventHandler({
      remoteListener: () => {
        throw new TypeError('listener is not a function');
      },
    });
    const outerHandler = wrapEventHandler({
      remoteListener: outerRemoteListener,
    });
    const hostEvent = { type: 'click', bubbles: true };

    expect(() => innerHandler(hostEvent)).toThrow('listener is not a function');
    outerHandler(hostEvent);

    expect(outerRemoteListener).toHaveBeenCalledTimes(1);
  });

  it('should forward the form control state of a native event only once, so a later handler cannot revert what the worker wrote', () => {
    const inputRemoteListener = jest.fn();
    const changeRemoteListener = jest.fn();
    const nativeInputEvent = { type: 'input' };
    const target = { value: 'ab', checked: true };

    wrapEventHandler({ remoteListener: inputRemoteListener })({
      type: 'input',
      target,
      nativeEvent: nativeInputEvent,
    });
    wrapEventHandler({ remoteListener: changeRemoteListener })({
      type: 'change',
      target,
      nativeEvent: nativeInputEvent,
    });

    expect(inputRemoteListener).toHaveBeenCalledWith({
      type: 'input',
      value: 'ab',
    });
    expect(changeRemoteListener).toHaveBeenCalledWith({ type: 'change' });
  });

  it('should forward the form control state of every distinct native event', () => {
    const remoteListener = jest.fn();
    const handler = wrapEventHandler({ remoteListener });
    const target = { value: 'ab' };

    handler({ type: 'change', target, nativeEvent: { type: 'input' } });
    handler({ type: 'change', target, nativeEvent: { type: 'input' } });

    expect(remoteListener).toHaveBeenNthCalledWith(1, {
      type: 'change',
      value: 'ab',
    });
    expect(remoteListener).toHaveBeenNthCalledWith(2, {
      type: 'change',
      value: 'ab',
    });
  });

  it('should still forward the form control state when the earlier handler for the native event failed', () => {
    const changeRemoteListener = jest.fn();
    const nativeInputEvent = { type: 'input' };
    const target = { value: 'ab' };
    const inputHandler = wrapEventHandler({
      remoteListener: () => {
        throw new TypeError('listener is not a function');
      },
    });

    expect(() =>
      inputHandler({ type: 'input', target, nativeEvent: nativeInputEvent }),
    ).toThrow('listener is not a function');
    wrapEventHandler({ remoteListener: changeRemoteListener })({
      type: 'change',
      target,
      nativeEvent: nativeInputEvent,
    });

    expect(changeRemoteListener).toHaveBeenCalledWith({
      type: 'change',
      value: 'ab',
    });
  });

  it('should forward the remote ids of the host target and related target', () => {
    const remoteListener = jest.fn();
    const target = {};
    const relatedTarget = {};
    const remoteElementIdByNode = new Map<unknown, string>([
      [target, 'target-id'],
      [relatedTarget, 'related-target-id'],
    ]);

    wrapEventHandler({
      remoteListener,
      findRemoteElementIdContainingNode: (node) =>
        remoteElementIdByNode.get(node),
    })({ type: 'focusout', bubbles: true, target, relatedTarget });

    expect(remoteListener).toHaveBeenCalledWith({
      type: 'focusout',
      bubbles: true,
      targetRemoteElementId: 'target-id',
      relatedTargetRemoteElementId: 'related-target-id',
    });
  });
});
