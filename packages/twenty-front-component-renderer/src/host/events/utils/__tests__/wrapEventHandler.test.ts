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
